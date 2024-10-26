const r1 = / |,|\$|€|£|¥|'|٬|،| /g
const r2 = / |\.|\$|€|£|¥|'|٬|،| /g

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
    if (!name || name === "") {
      let dataField = ctrl.getAttribute("data-field")
      if (!dataField && ctrl.parentElement && ctrl.parentElement.classList.contains("DayPickerInput")) {
        if (ctrl.parentElement.parentElement) {
          dataField = ctrl.parentElement.parentElement.getAttribute("data-field")
          isDate = true
        }
      }
      name = dataField
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
                val = new Date(ctrl.value).toISOString() // DateUtil.parse(ctrl.value, 'YYYY-MM-DD');
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
