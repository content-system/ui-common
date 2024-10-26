const r1 = / |,|\$|€|£|¥|'|٬|،| /g
const r2 = / |\.|\$|€|£|¥|'|٬|،| /g
const defaultLimit = 24

interface Locale {
  decimalSeparator: string
  groupSeparator: string
  currencyCode: string
  currencySymbol: string
  currencyPattern: number
}

function parseDate(v: string, format?: string): Date | null | undefined {
  if (!format || format.length === 0) {
    format = "MM/DD/YYYY"
  } else {
    format = format.toUpperCase()
  }
  const dateItems = format.split(/\/|\.| |-/)
  const valueItems = v.split(/\/|\.| |-/)
  let imonth = dateItems.indexOf("M")
  let iday = dateItems.indexOf("D")
  let iyear = dateItems.indexOf("YYYY")
  if (imonth === -1) {
    imonth = dateItems.indexOf("MM")
  }
  if (iday === -1) {
    iday = dateItems.indexOf("DD")
  }
  if (iyear === -1) {
    iyear = dateItems.indexOf("YY")
  }
  const month = parseInt(valueItems[imonth], 10) - 1
  let year = parseInt(valueItems[iyear], 10)
  if (year < 100) {
    year += 2000
  }
  const day = parseInt(valueItems[iday], 10)
  return new Date(year, month, day)
}
function getCurrentURL() {
  return window.location.origin + window.location.pathname
}

function fadeIn(el: HTMLElement, display?: string): void {
  el.style.opacity = "0"
  el.style.display = display || "block"
  ;(function fade() {
    let val = parseFloat(el.style.opacity)
    val += 0.1
    if (!(val > 1)) {
      el.style.opacity = val.toString()
      requestAnimationFrame(fade)
    }
  })()
}
function fadeOut(el: HTMLElement): void {
  el.style.opacity = "1"
  ;(function fade() {
    let val = parseFloat(el.style.opacity)
    val -= 0.1
    if (val < 0) {
      el.style.display = "none"
    } else {
      requestAnimationFrame(fade)
    }
  })()
}

function toast(msg: string): void {
  const sysToast = document.getElementById("sysToast") as HTMLElement
  sysToast.innerHTML = msg
  fadeIn(sysToast)
  setTimeout(() => {
    fadeOut(sysToast)
  }, 1340)
}
function showLoading(isFirstTime?: boolean) {
  const sysLoading = document.getElementById("sysLoading") as HTMLElement
  sysLoading.style.display = "block"
  if (isFirstTime) {
    sysLoading.classList.add("dark")
  } else {
    sysLoading.classList.remove("dark")
  }
}
function hideLoading() {
  const loading = document.getElementById("sysLoading") as HTMLElement
  loading.style.display = "none"
}

function toggleClass(e: HTMLElement | null | undefined, className: string): boolean {
  if (e) {
    if (e.classList.contains(className)) {
      e.classList.remove(className)
      return false
    } else {
      e.classList.add(className)
      return true
    }
  }
  return false
}

function valueOf(obj: any, key: string): any {
  const mapper = key.split(".").map((item) => {
    return item.replace(/\[/g, ".[").replace(/\[|\]/g, "")
  })
  const reSplit = mapper.join(".").split(".")
  return reSplit.reduce((acc, current, index, source) => {
    const value = getDirectValue(acc, current)
    if (!value) {
      source.splice(1)
    }
    return value
  }, obj)
}
function getDirectValue(obj: any, key: string): any {
  if (obj && obj.hasOwnProperty(key)) {
    return obj[key]
  }
  return null
}
function setValue(obj: any, key: string, value: any): any {
  let replaceKey = key.replace(/\[/g, ".[").replace(/\.\./g, ".")
  if (replaceKey.indexOf(".") === 0) {
    replaceKey = replaceKey.slice(1, replaceKey.length)
  }
  const keys = replaceKey.split(".")
  let firstKey = keys.shift()
  if (!firstKey) {
    return
  }
  const isArrayKey = /\[([0-9]+)\]/.test(firstKey)
  if (keys.length > 0) {
    const firstKeyValue = obj[firstKey] || {}
    const returnValue = setValue(firstKeyValue, keys.join("."), value)
    return setKey(obj, isArrayKey, firstKey, returnValue)
  }
  return setKey(obj, isArrayKey, firstKey, value)
}
function setKey(_object: any, _isArrayKey: boolean, _key: string, _nextValue: any) {
  if (_isArrayKey) {
    if (_object.length > _key) {
      _object[_key] = _nextValue
    } else {
      _object.push(_nextValue)
    }
  } else {
    _object[_key] = _nextValue
  }
  return _object
}

function decodeFromForm<T>(form: HTMLFormElement, locale?: Locale, currencySymbol?: string | null): T {
  const dateFormat = form.getAttribute("date-format")
  const obj = {} as T
  const len = form.length
  for (let i = 0; i < len; i++) {
    const ctrl = form[i] as HTMLInputElement
    let name = ctrl.getAttribute("name")
    const id = ctrl.getAttribute("id")
    let val: any
    let isDate = false
    let dataField = ctrl.getAttribute("data-field")
    if (dataField && dataField.length > 0) {
      name = dataField
    } else if ((!name || name === "") && ctrl.parentElement && ctrl.parentElement.classList.contains("DayPickerInput")) {
      if (ctrl.parentElement.parentElement) {
        dataField = ctrl.parentElement.parentElement.getAttribute("data-field")
        isDate = true
        name = dataField
      }
    }
    if (name != null && name !== "") {
      let nodeName = ctrl.nodeName
      const type = ctrl.getAttribute("type")
      if (nodeName === "INPUT" && type !== null) {
        nodeName = type.toUpperCase()
      }
      if (nodeName !== "BUTTON" && nodeName !== "RESET" && nodeName !== "SUBMIT") {
        switch (type) {
          case "checkbox":
            if (id && name !== id) {
              // obj[name] = !obj[name] ? [] : obj[name];
              val = valueOf(obj, name) // val = obj[name];
              if (!val) {
                val = []
              }
              if (ctrl.checked) {
                val.push(ctrl.value)
                // obj[name].push(ctrl.value);
              } else {
                // tslint:disable-next-line: triple-equals
                val = val.filter((item: string) => item != ctrl.value)
              }
            } else {
              const c0 = ctrl.checked as any
              if (c0 || c0 === "checked") {
                val = true
              }
            }
            break
          case "radio":
            const cv = ctrl.checked as any
            if (cv || cv === "checked") {
              val = ctrl.value
            }
            break
          case "date":
            if (ctrl.value.length === 10) {
              try {
                val = new Date(ctrl.value) // DateUtil.parse(ctrl.value, 'YYYY-MM-DD');
              } catch (err) {
                val = null
              }
            } else {
              val = null
            }
            break
          case "datetime-local":
            if (ctrl.value.length > 0) {
              try {
                val = new Date(ctrl.value) // DateUtil.parse(ctrl.value, 'YYYY-MM-DD');
              } catch (err) {
                val = null
              }
            } else {
              val = null
            }
            break
          default:
            val = ctrl.value
        }
        if (isDate && dateFormat && dateFormat.length > 0) {
          try {
            val = parseDate(val, dateFormat) // moment(val, dateFormat).toDate();
          } catch (err) {
            val = null
          }
        }
        const ctype = ctrl.getAttribute("data-type")
        let v: any = ctrl.value
        let symbol: string | null | undefined
        if (ctype === "currency") {
          symbol = ctrl.getAttribute("currency-symbol")
          if (!symbol) {
            symbol = currencySymbol
          }
          if (symbol && symbol.length > 0 && v.indexOf(symbol) >= 0) {
            v = v.replace(symbol, "")
          }
        }
        if (type === "number" || ctype === "currency" || ctype === "int" || ctype === "number") {
          if (locale && locale.decimalSeparator !== ".") {
            v = v.replace(r2, "")
          } else {
            v = v.replace(r1, "")
          }
          val = isNaN(v) ? null : parseFloat(v)
        }
        setValue(obj, name, val) // obj[name] = val;
      }
    }
  }
  return obj
}

function removeFormatUrl(url: string): string {
  const startParams = url.indexOf("?")
  return startParams !== -1 ? url.substring(0, startParams) : url
}
interface Filter {
  page?: number
  limit?: number
  firstLimit?: number
  fields?: string[]
  sort?: string
}
function buildUrl<F extends Filter>(ft: F, fields?: string, limit?: string): string {
  if (!fields || fields.length === 0) {
    fields = "fields"
  }
  if (!limit || limit.length === 0) {
    limit = "limit"
  }
  const pageIndex = ft.page
  if (pageIndex && !isNaN(pageIndex) && pageIndex <= 1) {
    delete ft.page
  }
  const keys = Object.keys(ft)
  const currentUrl = window.location.host + window.location.pathname
  let url = removeFormatUrl(currentUrl) + "?partial=true"
  for (const key of keys) {
    const objValue = (ft as any)[key]
    if (objValue) {
      if (key !== fields) {
        if (typeof objValue === "string" || typeof objValue === "number") {
          if (key === limit) {
            if (objValue !== defaultLimit) {
              if (url.indexOf("?") === -1) {
                url += `?${key}=${objValue}`
              } else {
                url += `&${key}=${objValue}`
              }
            }
          } else {
            if (url.indexOf("?") === -1) {
              url += `?${key}=${objValue}`
            } else {
              url += `&${key}=${objValue}`
            }
          }
        } else if (typeof objValue === "object") {
          if (objValue instanceof Date) {
            if (url.indexOf("?") === -1) {
              url += `?${key}=${objValue.toISOString()}`
            } else {
              url += `&${key}=${objValue.toISOString()}`
            }
          } else {
            if (Array.isArray(objValue)) {
              if (objValue.length > 0) {
                const strs: string[] = []
                for (const subValue of objValue) {
                  if (typeof subValue === "string") {
                    strs.push(subValue)
                  } else if (typeof subValue === "number") {
                    strs.push(subValue.toString())
                  }
                }
                if (url.indexOf("?") === -1) {
                  url += `?${key}=${strs.join(",")}`
                } else {
                  url += `&${key}=${strs.join(",")}`
                }
              }
            } else {
              const keysLvl2 = Object.keys(objValue)
              for (const key2 of keysLvl2) {
                const objValueLvl2 = objValue[key2]
                if (url.indexOf("?") === -1) {
                  if (objValueLvl2 instanceof Date) {
                    url += `?${key}.${key2}=${objValueLvl2.toISOString()}`
                  } else {
                    url += `?${key}.${key2}=${objValueLvl2}`
                  }
                } else {
                  if (objValueLvl2 instanceof Date) {
                    url += `&${key}.${key2}=${objValueLvl2.toISOString()}`
                  } else {
                    url += `&${key}.${key2}=${objValueLvl2}`
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  let p = "http://"
  const loc = window.location.href
  if (loc.length >= 8) {
    const ss = loc.substring(0, 8)
    if (ss === "https://") {
      p = "https://"
    }
  }
  return p + url
}

function searchNews(e: Event) {
  e.preventDefault()
  const target = e.target as HTMLButtonElement
  const form = target.form as HTMLFormElement
  const filter = decodeFromForm(form)
  const url = buildUrl(filter as any)
  fetch(url, {
    method: "GET",
  })
    .then((response) => {
      if (response.ok) {
        response.text().then((data) => {
          const pageBody = document.getElementById("pageBody")
          if (pageBody) {
            pageBody.innerHTML = data
          }
        })
      } else {
        console.error("Error:", response.statusText)
        alert("Failed to submit data.")
      }
    })
    .catch((err) => {
      console.log("Error: " + err)
      alert("An error occurred while submitting the form")
    })
}
function submitContact(e: Event) {
  e.preventDefault()
  const target = e.target as HTMLButtonElement
  const form = target.form as HTMLFormElement
  const contact = decodeFromForm(form)
  const url = getCurrentURL()
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json", // Ensure the server understands the content type
    },
    body: JSON.stringify(contact), // Convert the form data to JSON format
  })
    .then((response) => {
      if (response.ok) {
        response.text().then((data) => {
          console.log("Success:", data)
          alert("Data submitted successfully!")
        })
      } else {
        console.error("Error:", response.statusText)
        alert("Failed to submit data.")
      }
    })
    .catch((err) => {
      console.log("Error: " + err)
      alert("An error occurred while submitting the form")
    })
}
