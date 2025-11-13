const decode = (str: string) => {
  let rs = str
  try {
    rs = decodeURIComponent(str)
  } catch (err) {
    console.log(err)
    // noop
  }
  return rs
}

export const parseQueryString = (url: string) => {
  const queryString = url.split('?')[1]
  if (!queryString) {
    return {}
  }

  const result: Record<string, string> = {}

  queryString
    .split('&')
    .map((item) => item.split('='))
    .forEach((cur) => {
      const [key, value] = cur
      result[key] = decode(value)
    })

  return result
}

export const getPageQuery = () => {
  return parseQueryString(window.location.href)
}
