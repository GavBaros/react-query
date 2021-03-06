import React from 'react'

//

import { useQueryCache } from './queryCache'
import { useConfigContext } from './config'
import { useMountedCallback, Console } from './utils'

export function useBaseQuery(queryKey, queryFn, config = {}) {
  // Make a rerender function
  const rerender = useMountedCallback(React.useState()[1])

  // Build the final config
  const configContext = useConfigContext()

  config = {
    ...configContext.shared,
    ...configContext.queries,
    ...config,
  }

  // Get the query cache
  const queryCache = useQueryCache()

  // Build the query for use
  const query = queryCache.buildQuery(queryKey, queryFn, config)

  // Create a query instance ref
  const instanceRef = React.useRef()

  // Subscribe to the query when the subscribe function changes
  React.useEffect(() => {
    instanceRef.current = query.subscribe(() => rerender({}))

    // Unsubscribe when things change
    return instanceRef.current.unsubscribe
  }, [query, rerender])

  // Always update the config
  React.useEffect(() => {
    instanceRef.current.updateConfig(config)
  })

  // Run the instance when the query or enabled change
  React.useEffect(() => {
    if (config.enabled && query) {
      // Just for change detection
    }
    instanceRef.current.run()
  }, [config.enabled, query])

  const refetch = React.useCallback(async () => {
    try {
      await query.fetch()
    } catch (error) {
      Console.error(error)
    }
  }, [query])

  return {
    query,
    refetch,
    ...query.state,
  }
}
