import { Socket } from "node:net";
import { connect as connectTls, TLSSocket } from "node:tls";

type SmtpConfig = {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  secure: boolean;
  from: string;
  to: string;
};

type MailMessage = {
  subject: string;
  text: string;
};

type SmtpSocket = Socket | TLSSocket;

const smtpTimeoutMs = 10_000;

export async function sendSmtpMail(message: MailMessage) {
  const config = getSmtpConfig();

  if (!config) {
    console.warn("[alert] SMTP configuration is incomplete; overload alert not sent.");
    return false;
  }

  const socket = await connectToSmtp(config);

  try {
    await readSmtpResponse(socket);
    await sendCommand(socket, `EHLO ${getSmtpClientName()}`);

    if (config.user && config.pass) {
      await sendCommand(socket, "AUTH LOGIN", 334);
      await sendCommand(socket, Buffer.from(config.user).toString("base64"), 334);
      await sendCommand(socket, Buffer.from(config.pass).toString("base64"), 235);
    }

    await sendCommand(socket, `MAIL FROM:<${config.from}>`);
    await sendCommand(socket, `RCPT TO:<${config.to}>`);
    await sendCommand(socket, "DATA", 354);
    await sendRaw(
      socket,
      [
        `From: ${config.from}`,
        `To: ${config.to}`,
        `Subject: ${message.subject}`,
        "MIME-Version: 1.0",
        'Content-Type: text/plain; charset="UTF-8"',
        "",
        escapeSmtpData(message.text),
        ".",
        "",
      ].join("\r\n"),
    );
    await readSmtpResponse(socket);
    await sendCommand(socket, "QUIT").catch(() => undefined);

    return true;
  } finally {
    socket.destroy();
  }
}

function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const to = process.env.SMTP_ADMIN_EMAIL || process.env.ADMIN_EMAIL;

  if (!host || !Number.isFinite(port) || !to) {
    return null;
  }

  return {
    host,
    port,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    from: "noreply@yourteck.com",
    to,
  };
}

function connectToSmtp(config: SmtpConfig) {
  return new Promise<SmtpSocket>((resolve, reject) => {
    const socket = config.secure
      ? connectTls({ host: config.host, port: config.port, servername: config.host })
      : new Socket().connect(config.port, config.host);

    socket.setTimeout(smtpTimeoutMs);
    if (config.secure) {
      socket.once("secureConnect", () => resolve(socket));
    } else {
      socket.once("connect", () => resolve(socket));
    }
    socket.once("timeout", () => {
      socket.destroy();
      reject(new Error("SMTP connection timed out."));
    });
    socket.once("error", reject);
  });
}

async function sendCommand(socket: SmtpSocket, command: string, expectedCode = 250) {
  await sendRaw(socket, `${command}\r\n`);
  const response = await readSmtpResponse(socket);

  if (response.code !== expectedCode && response.code !== 235) {
    throw new Error(`SMTP command failed: ${command} (${response.raw})`);
  }
}

function sendRaw(socket: SmtpSocket, value: string) {
  return new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => {
      socket.off("error", onError);
      reject(error);
    };

    socket.once("error", onError);
    socket.write(value, () => {
      socket.off("error", onError);
      resolve();
    });
  });
}

function readSmtpResponse(socket: SmtpSocket) {
  return new Promise<{ code: number; raw: string }>((resolve, reject) => {
    let buffer = "";

    const cleanup = () => {
      socket.off("data", onData);
      socket.off("error", onError);
    };
    const onError = (error: Error) => {
      cleanup();
      reject(error);
    };
    const onData = (chunk: Buffer) => {
      buffer += chunk.toString("utf8");
      const lines = buffer.split(/\r?\n/).filter(Boolean);
      const lastLine = lines.at(-1);

      if (!lastLine || !/^\d{3} /.test(lastLine)) {
        return;
      }

      cleanup();
      resolve({
        code: Number(lastLine.slice(0, 3)),
        raw: buffer.trim(),
      });
    };

    socket.on("data", onData);
    socket.on("error", onError);
  });
}

function getSmtpClientName() {
  return process.env.SMTP_CLIENT_NAME || "yourteck-tools";
}

function escapeSmtpData(value: string) {
  return value.replace(/^\./gm, "..");
}
