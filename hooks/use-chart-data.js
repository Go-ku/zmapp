// Frontend hook for fetching chart data
export const useChartData = (chartType, timeRange = '30d', useHistorical = false) => {
    const [data, setData] = React.useState(null)
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState(null)
  
    React.useEffect(() => {
      const fetchData = async () => {
        try {
          setLoading(true)
          const params = new URLSearchParams({
            type: chartType,
            range: timeRange,
            historical: useHistorical.toString()
          })
          
          const response = await fetch(`/api/dashboard/charts?${params}`)
          
          if (!response.ok) {
            throw new Error('Failed to fetch chart data')
          }
          
          const result = await response.json()
          setData(result.data)
        } catch (err) {
          setError(err.message)
        } finally {
          setLoading(false)
        }
      }
  
      fetchData()
    }, [chartType, timeRange, useHistorical])
  
    return { data, loading, error }
  }