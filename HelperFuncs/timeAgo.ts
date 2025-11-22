export function timeAgo(timestamp: string | number | Date) {
  const now = new Date();
  const date = new Date(timestamp); // works with ISO strings with timezone
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    yrs: 31536000,   // 365*24*60*60
    month: 2592000,   // 30*24*60*60
    week: 604800,     // 7*24*60*60
    day: 86400,       // 24*60*60
    hr: 3600,       // 60*60
    min: 60,
    sec: 1,
  };

  for (const unit in intervals) {
    const interval = Math.floor(seconds / intervals[unit]);
    if (interval >= 1) {
      return `${interval} ${unit}${interval > 1 ? "s" : ""} ago`;
    }
  }

  return "just now";
}

