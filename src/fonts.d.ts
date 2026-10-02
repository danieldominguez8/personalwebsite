// Fontsource variable packages export CSS without a .css suffix (exports "./*" -> "./*.css").
declare module "@fontsource-variable/big-shoulders-display/wght";
declare module "@fontsource-variable/big-shoulders-display/files/*?url" {
  const url: string;
  export default url;
}
declare module "@fontsource/ibm-plex-sans/files/*?url" {
  const url: string;
  export default url;
}
