import { getPerformanceData } from "./get-performance-data";

export async function getTimingFor(resourceName, page) {
  const perfData = await getPerformanceData(resourceName, page);

  if (!perfData) {
    return null;
  }


  switch (perfData.length) {
    case 0:
      return null;
    case 1:
      return Math.round(perfData[0].duration * 1E3) / 1E3;
    default:
      return perfData.map(p => Math.round(p.duration * 1E3) / 1E3)
  }
}