export const getTimeDiff = (unixTime: number) => {
  const now = new Date();
  const past = new Date(Number(unixTime) * 1000); // Unix 时间戳转换为毫秒
  const diffInMilliSeconds = Math.abs(now.getTime() - past.getTime());
  
  const minutes = Math.ceil(diffInMilliSeconds / (1000 * 60));
  const hours = Math.ceil(diffInMilliSeconds / (1000 * 60 * 60));
  const days = Math.ceil(diffInMilliSeconds / (1000 * 60 * 60 * 24));
  
  if (minutes < 60) {
    return `Last updated ${minutes} mins ago`;
  } else if (hours < 24) { // 修改为24小时，以便更准确地反映小时的计算
    return `Last updated ${hours} hours ago`;
  } else {
    return `Last updated ${days} days ago`;
  }
};

export const getDateFromUnixtime = (unixTime: number) => {
    const date = new Date(Number(unixTime) * 1000);

    // 获取年、月、日，并确保月和日以 "MM" 或 "DD" 格式呈现
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从 0 开始，所以加 1
    const day = date.getDate().toString().padStart(2, '0');
  
    // 返回格式化的日期字符串
    return `${year}-${month}-${day}`;
}

function divideBy10ToThe18th(n: bigint): string {
  // 将BigInt除以10^18
  const result = n / BigInt(1e18);
  // 获取除法后的余数
  const remainder = n % BigInt(1e18);
  // 转换余数为字符串，确保它有18位数字，不足的用0补齐
  let remainderStr = remainder.toString();
  remainderStr = "0".repeat(18 - remainderStr.length) + remainderStr;
  // 去掉尾部多余的0
  remainderStr = remainderStr.replace(/0+$/, "");
  // 如果没有余数，则直接返回结果
  if (remainderStr === "") {
    return result.toString();
  }
  // 返回整数部分和小数部分的组合
  return `${result}.${remainderStr}`;
}

export {divideBy10ToThe18th};