export const getStringLength = (input: string) => {
  let len = 0;
  for (const char of input) {
    if (char.charCodeAt(0) > 127) {
      len += 2;
    } else {
      len++;
    }
  }
  return len;
};
