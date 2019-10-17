Vue.use(Vue2PerfectScrollbar);
Vue.use(VueShortkey);
Vue.directive('focus', {
  // When the bound element is inserted into the DOM...
  inserted: function (el) {
    // Focus the element
    el.focus()
  }
});
Object.defineProperty(Vue.prototype, "_", { value: _ });

Vue.component("loading-table-rows", {
  template: `<table class="f6 collapse pv2 ph3 w-100">
        <tbody>
            <tr class="bg-white bt b--light-gray">
                <td class="pv3 ph2 tl ttc pointer" v-for="key in columns">
                    <div class="animated-background o-60 br3">&nbsp;</div>
                </td>
            </tr>
            <template v-for="n in 6">
                <tr class="striped--brand-gray">
                    <td class="pa2" v-for="key in columns">
                        <div class="animated-background o-60 br3">&nbsp;</div>
                    </td>
                </tr>
            </template>
            <template v-for="n in 4">
                <tr class="striped--brand-gray">
                    <td class="pa2" v-for="key in columns">
                        <div style="font-size: 10px">&nbsp;</div>
                    </td>
                </tr>
            </template>
        </tbody>
    </table>`,
  props: {
    columns: Array
  }
});

Vue.component("table-component", {
  template: `<div>
    <div class="overflow-auto">
        <!-- Table filter -->
        <div class="bg-white bt b--light-gray pa2" v-if="_.size(filterMapping) || _.size(viewMapping)">
            <div class="flex items-center">
                <div class="pr3" v-if="_.size(filterMapping)">
                    <div class="dib">
                        <i class="fa fa-filter blue pa2 pointer dim" @click="addFilterModal = !addFilterModal"></i>

                        <!-- Current filters -->
                        <div class="dib pa2 bg-blue br4 white mr2 f6" v-for="(filter, index) in filters">
                            <span v-if="filter.type === 'number'">
                                {{ filter.name }} {{ filter.operator }} {{ filter.value }}
                            </span>
                            <span v-if="filter.type === 'search'">
                                <i class="fa fa-search mh1"></i> {{ filter.name }} contains "{{ filter.value }}"
                            </span>
                            <span v-if="filter.type === 'enumerated'">
                                <i class="fa fa-list-ul mh1"></i> {{ filter.name }} is {{ filter.values.join(",") }}
                            </span>
                            <span v-if="filter.type === 'custom'">
                                <i class="fa fa-search mh1"></i> {{ filter.name }} = {{ filter.value }}
                            </span>
                            <i class="fa fa-times-circle pointer pl2 w1 v-mid" :class="[isHoveringCloseIndex === index ? 'o-60 emphasizeClickable' : 'o-30']" v-on:mouseover="isHoveringCloseIndex = index" v-on:mouseout="isHoveringCloseIndex = false" @click="removeFilter(index)"></i>
                        </div>

                        <div class="dib f6 gray dim pointer pv2" @click="addFilterModal = !addFilterModal">Filters</div>
                    </div>
                    <div>
                        <!-- Close filter modal mask -->
                        <div class="absolute top-0 left-0 w-100 h-100" v-show="addFilterModal" @click="closeFilterTypeView"></div>
                        <!-- Filter modal -->
                        <transition name="scale-in-tl">
                            <div class="absolute card-shadow z-2 bg-white br1" v-show="addFilterModal" v-shortkey="['esc']" @shortkey="closeFilterTypeView">
                                <perfect-scrollbar class="w5" style="max-height: 200px;">

                                    <template v-if="!filterTypeView">
                                        <div class="pa3 lh-copy dim pointer pv2 bb b--near-black cf" v-for="(filter, key) in filterMapping" @click='filterTypeView = _.get(filterMapping, key, "")'>
                                            <div class="fl w-90">{{ filter.name }}</div> <div class="fr w-10"><i class="fa fa-chevron-right tr"></i></div>
                                        </div>
                                    </template>

                                    <!-- Number Filter -->
                                    <transition name="slide2-fade">
                                        <div class="w-100 h-100" v-if="filterTypeView.type === 'number'">
                                            <div class="bg-blue white pv2 tc">
                                                {{ filterTypeView.name }}
                                                <i class="fa fa-times absolute right-1 pointer dim" @click="closeFilterTypeView"></i>
                                            </div>
                                            <div class="pa3">
                                                <div class="pb3 cf">
                                                    <div class="flex items-center">
                                                        <select v-model="filterOperator" title="filter operator" class="select h2 mr2">
                                                            <option value=">">></option>
                                                            <option value="<"><</option>
                                                            <option value="=">=</option>
                                                        </select>
                                                        <input
                                                                title="filter value"
                                                                class="input h2 w-100"
                                                                v-model="filterValue"
                                                                type="text"
                                                                placeholder="12345"
                                                                v-focus
                                                                v-shortkey="['enter']" @shortkey="addFilter">
                                                    </div>
                                                </div>
                                                <div class="tr">
                                                    <button class="button white bg-blue" @click="addFilter"><i class="fa fa-plus"></i> Add</button>
                                                </div>
                                            </div>
                                        </div>
                                    </transition>

                                    <!-- Search/Custom Filter -->
                                    <transition name="slide2-fade">
                                        <div class="w-100 h-100" v-if="filterTypeView.type === 'search' || filterTypeView.type === 'custom'">
                                            <div class="bg-blue white pv2 tc">
                                                {{ filterTypeView.name }}
                                                <i class="fa fa-times absolute right-1 pointer dim" @click="closeFilterTypeView"></i>
                                            </div>
                                            <div class="pa3">
                                                <div class="pb3 cf">
                                                    <div class="flex items-center">
                                                        <i class="fa fa-search mr2"></i>
                                                        <input
                                                                title="filter value"
                                                                class="input h2 w-100"
                                                                v-model="filterValue"
                                                                type="text"
                                                                v-focus
                                                                v-shortkey="['enter']"
                                                                @shortkey="addFilter">
                                                    </div>
                                                </div>
                                                <div class="tr">
                                                    <button class="button white bg-blue" @click="addFilter"><i class="fa fa-plus"></i> Add</button>
                                                </div>
                                            </div>
                                        </div>
                                    </transition>

                                    <!-- Enumerated Filter -->
                                    <transition name="slide2-fade">
                                        <div class="w-100 h-100" v-if="filterTypeView.type === 'enumerated'">
                                            <div class="bg-blue white pv2 tc">
                                                {{ filterTypeView.name }}
                                                <i class="fa fa-times absolute right-1 pointer dim" @click="closeFilterTypeView"></i>
                                            </div>
                                            <div class="pa3">
                                                <div class="pb3 cf">
                                                    <div class="fl w-100">
                                                        <div class="flex items-center">
                                                            <i class="fa fa-list-ul mr2"></i>
                                                            <input
                                                                    title="filter value"
                                                                    class="input h2 w-100"
                                                                    v-model="filterValue"
                                                                    type="text"
                                                                    placeholder="1,2,3"
                                                                    v-focus
                                                                    v-shortkey="['enter']" @shortkey="addFilter">
                                                        </div>
                                                    </div>
                                                </div>
                                                <div class="tr">
                                                    <button class="button white bg-blue" @click="addFilter"><i class="fa fa-plus"></i> Add</button>
                                                </div>
                                            </div>
                                        </div>
                                    </transition>
                                </perfect-scrollbar>
                            </div>
                        </transition>
                    </div>
                </div>
                <div class="relative" v-if="viewMapping">
                    <!-- Current view -->
                    <div class="bg-blue white pa2 tc br4" v-if="_.size(activeView)">
                        {{ activeView.name }} View
                        <i class="fa fa-times-circle pointer pl2 w1 v-mid emphasizeClickable reverse-dim" @click="activeView.unset"></i>
                    </div>
                    <div v-else :class="{'ph3 bl b--near-black': _.size(filterMapping) }" @click="selectViewModal = !selectViewModal">
                        <i class="fa fa-layer-group blue pa2 pointer dim"></i>
                        <div class="dib f6 gray dim pointer pv2">Views</div>
                    </div>

                    <!-- View selection modal -->
                    <transition name="scale-in-tl">
                        <div class="absolute card-shadow z-2 bg-black white br1" v-show="selectViewModal" v-shortkey="['esc']" @shortkey="selectViewModal = false">
                            <perfect-scrollbar class="w5" style="max-height: 200px;">
                                <div class="pa3 lh-copy dim pointer pv2 bb b--near-black cf" v-for="view in viewMapping">
                                    <div @click="selectView(view)">{{ view.name }}</div>
                                </div>
                            </perfect-scrollbar>
                        </div>
                    </transition>
                </div>
                <!-- Close view selection modal mask -->
                <div class="absolute top-0 left-0 w-100 h-100 pointer" v-show="selectViewModal" @click="selectViewModal = false"></div>
            </div>
        </div>

        <table class="f6 collapse pv2 ph3 w-100">
            <tbody>
            <!-- Head -->
            <tr class="bg-white bt b--light-gray">
                <th class="sticky-header normal pa2 tl ttc pointer shadow-light2 z-1"
                    style="-moz-user-select: none; -webkit-user-select: none; -ms-user-select:none; user-select:none;"
                    :class="{ 'light-blue': sortKey && sortKey === _.get(mapping, key) }"
                    v-for="key in columns"
                >

                    <!-- Checkboxes -->
                    <div class="dt w-100 tc" v-if="key === 'checkbox'">
                        <input title="select all" class="dtc" type="checkbox" v-model="allSelected" :indeterminate.prop="indeterminate">
                    </div>

                    <div class="dt w-100" :class="_.get(headingStyleMapping, key) || _.get(cellAlignments, key) || 'tl'" v-else>
                        <div class="dtc" @click.self="sortBy(_.get(mapping, key))">{{ key.replace(/_/g, " ") }}</div>
                        <div class="dtc pl1 v-mid" @click.self="sortBy(_.get(mapping, key))" v-show="sortKey && sortKey === _.get(mapping, key)">
                            <i class="fa o-40"
                               :class="{
                                    'fa-chevron-up': !reverse && sortKey && sortKey === _.get(mapping, key),
                                    'fa-chevron-down': reverse && sortKey && sortKey === _.get(mapping, key)}"
                               @click="sortBy(_.get(mapping, key))"
                            ></i>
                        </div>
                    </div>

                </th>
            </tr>

            <!-- Body -->
            <template v-if="_.size(sortedData)">
                <template v-for="(row, row_id) in _.chunk(sortedData, pageSize)[page - 1]">
                    <tr @click="rowClicked(_.get(row, rowIdMap, false))" class="striped--brand-gray hover-row">
                        <td class="pa2 tc" v-for="column in columns">
                            <input title="select" type="checkbox" v-if="column === 'checkbox'" v-model="row.selected" @click.stop="">

                            <component :is="dynamicComponents[column]" v-if="_.get(dynamicComponents, column)" :row="row" :column="column"></component>

                            <div :class="_.get(cellStyleMapping, column) || _.get(cellAlignments, column)" v-else-if="_.get(mapping, column)" v-on:dblclick="cellSelected(row_id, column)">
                                <div class="truncate mw6" v-if="inputCell !== row_id + ':' + column">
                                  {{ _.get(formatMapping, column) ? formatMapping[column](_.get(row, mapping[column])) : _.get(row, mapping[column]) }}
                                </div>
                                <div v-else>
                                  <input v-model="editableCell">
                                </div>
                            </div>
                        </td>
                    </tr>
                    <component :is="expandedRowComponent" :row="row" :columns="columns" v-if="_.indexOf(clicked, row[rowIdMap]) !== -1"></component>
                </template>
            </template>

            <!-- For UX reasons: put in empty rows on no data -->
            <template v-if="!_.size(sortedData)">
                <tr v-for="i in 10" :key="i" class="striped--brand-gray">
                    <td class="pa2" v-for="_ in columns">
                        <div>&nbsp;</div>
                    </td>
                </tr>
            </template>

            <!-- For UX reasons: put in empty rows on little data -->
            <template v-if="_.size(sortedData) && _.size(sortedData) < 10">
                <tr class="striped--brand-gray" :key="i.id" v-for="i in Math.abs(10 - _.size(sortedData))">
                    <td class="pa2" v-for="_ in columns">
                        <div>&nbsp;</div>
                    </td>
                </tr>
            </template>

            </tbody>
        </table>
    </div>

    <!-- Table Footer -->
    <div>
        <!-- Pagination -->
        <div class="flex items-center f6 pv3 bg-white" v-if="pages.length >= 2">

            <!-- Per Page Option -->
            <div class="w-25 pl2">
                <div class="dib link black ph3 pv2 ba br2 b--near-black pointer">
                    <div class="dim" @click="expandPerPageOption = !expandPerPageOption">
                        <span class="pr3 pb2">{{ pageSize }}</span> <i class="fa fa-chevron-down"></i>
                    </div>
                    <div class="relative tl" style="top: 0.5rem" v-if="expandPerPageOption">
                        <div class="pointer pb2" v-for="size in pageSizes" @click="page = 1;pageSize = size; expandPerPageOption = false;" v-if="size !== pageSize">{{ size }}</div>
                    </div>
                </div>
                <div class="dib pa2 v-top"> Per page</div>
            </div>

            <!-- Page selector -->
            <div class="w-50 tc">
                <div class="dib overflow-hidden ba br2 b--near-black" v-if="pages.length >= 2">
                    <nav class="cf">
                        <div class="fl dib link dim black ph3 pv2 br b--near-black pointer" @click="previousPage" title="Previous"><span class="fa fa-chevron-left"></span></div>
                        <div class="fr dib link dim black ph3 pv2 pointer" @click="nextPage" title="Next"><span class="fa fa-chevron-right"></span></div>

                        <div class="overflow-hidden center dt tc">
                            <template v-for="n in paginationLayout">
                                <div
                                        class="dtc ph3 pv2 br b--near-black"
                                        :class="{ 'blue': page === n, 'pointer dim link': n !== '...' }"
                                        @click="jumpToPage(n)"
                                        :title="'Page '+ n"
                                >
                                    {{ n }}
                                </div>
                            </template>
                        </div>
                    </nav>
                </div>
            </div>

            <div class="w-25">&nbsp;</div>
        </div>

        <slot/>
    </div>
</div>`,
  data() {
    return {
      // table settings
      filterBy: false,
      sortedData: this.data || this.sortedData,
      reverse: false,
      sortCounter: 0,
      sortKey: "",
      page: 1,
      pageSize: 100,
      startingPage: 1,
      expandPerPageOption: false,
      pageSizes: [10, 20, 50, 100],
      clicked: [],
      cellAlignments: {},

      // filters
      addFilterModal: false,
      filterTypeView: "",
      filterOperator: ">",
      filterValue: "",
      filters: [],
      isHoveringCloseIndex: false,

      // views
      selectViewModal: false,

      // inputs
      inputCell: false
    };
  },
  beforeMount: function() {
    this.calculateCellAlignments();
  },
  computed: {
    pages: {
      get: function() {
        return _.chunk(this.sortedData, this.pageSize);
      }
    },
    paginationLayout: {
      get: function() {
        return paginationLayout(this.pages, this.page);
      }
    },
    allSelected: {
      get: function() {
        const numberSelected = _.filter(this.sortedData, {
          selected: true
        }).length;
        window.data.numberSelected = numberSelected;
        // check by finding the number that are not selected
        return numberSelected === this.sortedData.length;
      },
      set: function(newValue) {
        _.each(this.sortedData, function(item) {
          _.set(item, "selected", newValue);
        });
        return newValue;
      }
    },
    indeterminate: {
      get: function() {
        const numberSelected = _.filter(this.sortedData, {
          selected: true
        }).length;
        return numberSelected !== this.sortedData.length && numberSelected > 0;
      }
    },
    editableCell: {
      get: function () {
        const keys = this.inputCell.split(":");
        const index = keys[0];
        const column = keys[1];
        const row = _.get(this.sortedData, index);
        const path = this.mapping[column];
        return this._.get(row, path);
      },
      set: function (newValue) {
        const keys = this.inputCell.split(":");
        const index = keys[0];
        const column = keys[1];
        const row = _.get(this.sortedData, index);
        const path = this.mapping[column];
        return this._.set(row, path, newValue);
      }
    }
  },
  watch: {
    filters: function(val) {
      console.log(sortAndFilter.call(this));
    },
    searchTerm: function(val) {
      if (!this.search) {
        return false;
      }
      this.search(val);
    },
    data: function () {
      this.calculateCellAlignments();
    }
  },
  props: {
    data: Array,
    columns: Array,
    mapping: Object,
    dynamicComponents: Object,
    expandedRowComponent: String,
    formatMapping: Object,
    cellStyleMapping: Object,
    headingStyleMapping: Object,
    filterMapping: Object,
    search: Function,
    searchTerm: String,
    viewMapping: Object,
    activeView: Object,
    rowIdMap: {
      type: String,
      default: "id"
    }
  },
  methods: {
    sortBy: function(key) {
      const log = sortAndFilter.call(this, key);
      if (window.debug) {
        console.log(log);
      }
    },
    nextPage: function() {
      if (this.page < this.pages.length) {
        this.page += 1;
      }
    },
    previousPage: function() {
      if (this.page > 1) {
        this.page -= 1;
      }
    },
    jumpToPage: function(page) {
      if (page !== "...") {
        this.page = page;
      }
    },
    closeFilterTypeView: function() {
      this.filterTypeView = "";
      this.filterValue = "";
      this.addFilterModal = false;
    },
    addFilter: function() {
      const filter = Object.assign({}, this.filterTypeView, {
        operator: this.filterOperator,
        value: this.filterValue,
        values: this.filterValue.split(",")
      });
      this.filters.push(filter);
      this.closeFilterTypeView();
    },
    removeFilter: function(index) {
      this.filters.splice(index, 1);
      // Vary nuanced UX.  If the user is in the middle of the pagination set, they typically
      // use sorting to confirm the existence of different data, the middle doesn't illustrate the edges
      // they look to confirm.  This can always be seen on page 1.
      this.page = 1;
    },
    rowClicked: function(id) {
      if (id === false) {
        return false;
      }
      if (_.includes(this.clicked, id)) {
        return (this.clicked = _.without(this.clicked, id));
      }

      this.clicked = _.union(this.clicked, [id]);
    },
    selectView: function(view) {
      window.data.activeView = view;
      view.set();
      this.selectViewModal = false;
    },
    cellSelected: function (row_id, column) {
      this.inputCell = this.inputCell ? false : row_id + ":" + column;
    },
    calculateCellAlignments: function () {
      if (!this.data.length) {
        return false;
      }
      const rows = this.data;
      // Scan first row for value types and assign cell alignments
      for (let i = 0; i < 1; i++) {
        Object.keys(rows[i]).map(key => {
          const column = _.invert(this.mapping)[key];
          // cell alignments
          switch (typeof rows[i][key]) {
            case "number":
              this.cellAlignments[column] = "tr";
              break;
            default:
              this.cellAlignments[column] = "tl";
          }
        })
      }
    }
  }
});
