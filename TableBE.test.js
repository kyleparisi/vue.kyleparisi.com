function sortAndFilter(key) {
  const params = {}
  if (this.page) {
    params["page"] = this.page
  }
  if (this.pageSize) {
    params["page_size"] = this.pageSize
  }
  const base = settings.apiBase
  console.log(this, key)
  let url = `${base}`

  const runRequest = async () => {
    data.loading = true
    const param_str = "?" + Object.keys(params).map(key => `${key}=${params[key]}`).join("&")
    const response = await ky.get(url + param_str, {headers: settings.apiHeaders})
    const json = await response.json()
    data.count = json.count
    data.gridData = json.results
    data.loading = false
  }
  if (!key) {
    runRequest()
    return
  }

  let log = "";

  if (!key && !_.size(this.filters) && !this.sortKey) {
    log += "Reset everything if there is no key or filters.\n";
    this.sortKey = "";
    this.reverse = false;
    this.sortCounter = 0;
    runRequest();
    return log;
  }

  if (this.sortKey) {
    log += "Sort key is supplied, sorting needs to be updated.\n";
    this.reverse = !this.reverse;
    this.sortCounter++;
  }

  if (this.sortKey && this.sortKey !== key) {
    log += "Different sort key selected from previous sort.\n";
    this.reverse = false;
    this.sortCounter = 0;
  }

  log += "Sorting.\n";
  this.sortKey = key || this.sortKey;

  if (this.sortCounter >= 2) {
    log += "Sort counter exceeded 2 sorts.  Reset sorting settings.\n";
    this.sortKey = "";
    this.reverse = false;
    this.sortCounter = 0;
  }

  if (this.sortKey !== "") {
    const reverseKey = this.reverse ? "-" : ""
    params["ordering"] = `${reverseKey}${this.sortKey}`
  }

  if (!_.size(this.filters)) {
    log += "No filters.  Done sorting.\n";
    runRequest();
    return log;
  }

  log += "Done sorting, apply filters\n";

  log += "Reset page to 1 to apply filters.\n";
  _.set(this, "page", 1);

  return log;
}

data.mapping = {
  name: "client_name",
  accounts: "total_accounts",
  aum: "total_aum",
  cash: "total_cash_usd",
  unassigned_accounts: "unassigned_goal_count"
};
data.gridColumns = Object.keys(data.mapping);
data.cellStyleMapping = {
  id: "tc"
};
data.headingStyleMapping = {
  id: "tc",
  age: "tr"
};
const formatMoney = function (v) {
  return v.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
};

data.formatMapping = {
  aum: formatMoney,
  cash: formatMoney
};

window.debug = true
window.addEventListener('load', function () {
  sortAndFilter()
})
