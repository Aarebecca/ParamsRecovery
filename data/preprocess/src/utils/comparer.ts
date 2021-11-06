/**
 * 专用于变量名的比较器
 */
export function comparer(str: string) {
  const raw = str;
  const val = raw.slice(0, 3) === "..." ? raw.slice(3) : raw;

  return {
    get raw() {
      return raw;
    },
    get val() {
      return val;
    },
    cmp(tar: string) {
      return tar === val;
    },
    in(arr: string[]) {
      return arr.includes(val);
    },
  };
}
