var dayOfYear = function(year, month, day){
  //判断输入值是否为数字类型
  if(typeof year !== 'number' || typeof month !== 'number' || typeof day !== 'number')
    return;

  //如果年份能被4整除，则表明该年是闰年，2月有29天，全年一共366天
  var leapYear = (year%4 === 0) ? true: false;
  var days = leapYear ? 366 : 365;
  var febDays = leapYear ? 29 : 28;

  //每个月天数
  var monthDay = [31, febDays, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  if(year < 0 || month > 12 || month < 0 || day < 0 || day > monthDay[month]){
    return;
  }

  var date = 0;
  for(var i=1; i < month; i++){
    date += monthDay[i-1];
  }

  //各月天数 + day
  return date + day;
}
