export async function getTimingFor(resource, page) {
  const perfData = await getPerformanceData(page, resource);

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