export const lstrip = (str: string, char: string) => {
  return str.replace(new RegExp(`^${char}+`), "");
};

export const rstrip = (str: string, char: string) => {
  return str.replace(new RegExp(`${char}+$`), "");
};

export const strip = (str: string, char: string) => {
  return lstrip(rstrip(str, char), char);
};
