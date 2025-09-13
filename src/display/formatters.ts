export function formatStars(stars: number): string {
  if (stars < 1000) {
    return stars.toString();
  } else if (stars < 10000) {
    return `${Math.round(stars / 100) / 10}K`;
  } else if (stars < 1000000) {
    return `${Math.round(stars / 1000)}K`;
  } else {
    return `${Math.round(stars / 100000) / 10}M`;
  }
}