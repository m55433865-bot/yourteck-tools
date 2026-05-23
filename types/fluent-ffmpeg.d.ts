declare module "fluent-ffmpeg" {
  type FfmpegCommand = {
    noVideo(): FfmpegCommand;
    audioCodec(codec: string): FfmpegCommand;
    audioBitrate(bitrate: string): FfmpegCommand;
    format(format: string): FfmpegCommand;
    output(path: string): FfmpegCommand;
    on(event: "end", listener: () => void): FfmpegCommand;
    on(event: "error", listener: (error: Error) => void): FfmpegCommand;
    run(): void;
  };

  type FfmpegFactory = {
    (path: string): FfmpegCommand;
    setFfmpegPath?: (path: string) => void;
  };

  const ffmpeg: FfmpegFactory;
  export default ffmpeg;
}
