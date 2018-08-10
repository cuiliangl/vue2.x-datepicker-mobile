<template>
    <div class="common-date-picker">
        <ui-mask :showMask="showDatePicker"
                 :opacity=".4"
                 @tap="closeDatePicker">
        </ui-mask>
        <div class="date-picker" :class="{'show-date': showDatePicker}">
            <header @click="closeDatePicker">
                <button class="fl">取消</button>
                <h1>{{title}}</h1>
                <button class="fr">确定</button>
            </header>
            <div class="ub">
                <div class="year-list" id="wrapper-year" v-if="yearList.length">
                    <ul ref="year">
                        <li ref="itemYear"></li>
                        <li></li>
                        <li v-for="year in yearList" :key="year" >{{year}}年</li>
                        <li></li>
                        <li></li>
                    </ul>
                </div>
                <div class="month-list" id="wrapper-month" v-if="monthList.length">
                    <ul ref="month">
                        <li ref="itemMonth"></li><li></li>
                        <li v-for="month in monthList" :key="month">{{month}}月</li>
                        <li></li>
                        <li></li>
                    </ul>
                </div>
                <div class="day-list" id="wrapper-day" v-if="dayList.length">
                    <ul ref="day">
                        <li ref="itemDay"></li>
                        <li></li>
                        <li v-for="day in dayList" :key="day">{{day}}日</li>
                        <li></li>
                        <li></li>
                    </ul>
                </div>
                <div class="hours-list" id="wrapper-hours" v-if="hoursList.length">
                    <ul ref="hours">
                        <li ref="itemHours"></li>
                        <li></li>
                        <li v-for="hours in hoursList" :key="hours">{{hours}}时</li>
                        <li></li>
                        <li></li>
                    </ul>
                </div>
                <div class="sel-mask top"></div>
                <div class="sel-mask middle"></div>
                <div class="sel-mask bottom"></div>
            </div>
        </div>
    </div>
</template>

<script>

    /**
     * @file 时间组件
     * @author cuiliangliang
     * @since 2018.8.7
     */

    // 如果要限制月 日 时，则必须连年一同限制，不能只限制其中一个

    import Scroll from './scroll';
    import uiMask from '../ui-mask';

    const DATE = new Date();

    export default {
        name: "datepicker",
        props: {
            /**
             * 类型
             * 'Y-M-D'      年月日
             * 'Y-M'        年月
             * 'M-D'        月日
             * 'Y_M-D-H'    年月日时
             **/
            type: {
                type: String,
                default: 'Y-M-D-H'
            },
            title: {
                type: String,
                default: '请选择时间'
            },
            minYear: {
                type: [Number, String],
                default: 1950
            },
            maxYear: {
                type: [Number, String],
                default: new Date().getFullYear() + 20
            },

            // 只针对当前及之前年份，当年选择到当前年之后，则月为1月到12月
            minMonth: {
                type: [Number, String],
                default: '01'
            },

            // 只针对当前年下的最小月份
            minDay: {
                type: [Number, String],
                default: '01'
            },

            // 最小时 只针对当前年，当前月，当前日， 这个时间之后则为0-23
            minHours: {
                type: [Number, String],
                default: '00'
            },
            showDatePicker: {
                type: Boolean,
                default: false
            },
            defaultValue: {
                type: Array,
                default: () => {
                    return [
                        DATE.getFullYear(),
                        DATE.getMonth() + 1,
                        DATE.getDate(),
                        DATE.getHours()
                    ];
                }
            }
        },
        components: {
            uiMask
        },
        data() {
            return {
                scrollArray: [],
                year: this.minYear,
                month: this.minMonth,
                day: this.minDay,
                hours: this.minHours,

                // 存props传过来的值
                minYearVal: this.minYear,
                minMonthVal: this.minMonth,
                minDayVal: this.minDay,
                minHoursVal: this.minHours,
                dateValue: this.defaultValue,

                // 每月的天数
                totalDay: 30,

                // 存储时间点的索引
                yearIndex: 0,
                monthIndex: 0,
                dayIndex: 0,
                hoursIndex: 0
            }
        },
        computed: {
            yearList() {
                let yearList = [];

                let {minYearVal, maxYear} = this;

                for (let i = parseInt(minYearVal, 10); i <= parseInt(maxYear, 10); i++) {
                    yearList.push(i);
                }

                return yearList;
            },
            monthList() {
                let monthList = [];
                let minMonthVal = parseInt(this.minMonthVal, 10);

                for (let i = minMonthVal; i <= 12; i++) {
                    if (i < 10) {
                        i = '0' + i;
                    }
                    monthList.push(i);
                }

                return monthList;
            },
            dayList() {
                let dayList = [];
                let minDayVal = parseInt(this.minDayVal, 10);
                let totalDay = this.getTotalDay();

                if (this.type === 'Y-M-D' || this.type === 'M-D' || this.type === 'Y-M-D-H') {
                    for (let i = minDayVal; i <= totalDay; i++) {
                        if (i < 10) {
                            i = '0' + i;
                        }
                        dayList.push(i);
                    }
                }

                return dayList;
            },
            hoursList() {
                let hoursList = [];
                let minHoursVal = parseInt(this.minHoursVal, 10);

                if (this.type === 'Y-M-D-H') {
                    for (let i = minHoursVal; i < 24; i++) {
                        if (i < 10) {
                            i = '0' + i
                        }
                        hoursList.push(i);
                    }
                }

                return hoursList;
            }
        },
        mounted() {
            this.getDateIndex();

            this.$nextTick(() => {
                this.initScrollAll();
            })
        },
        methods: {
            closeDatePicker() {
                this.$emit('getDateValue', this.dateValue);
            },

            // 根据type调用相应的方法
            initScrollAll() {
                if (this.type === 'Y-M-D' || this.type === 'Y-M' || 'Y-M-D-H') {
                    // 初始化年
                    this.scrollInitYear(this.yearIndex);
                }

                if (this.type === 'Y-M-D' || this.type === 'M-D' || this.type === 'Y-M-D-H') {
                    // 初始化日
                    this.scrollInitDay(this.dayIndex);
                }

                if (this.type === 'Y-M-D-H') {
                    // 初始化时
                    this.scrollInitHours(this.hoursIndex);
                }

                // 初始化月
                this.scrollInitMonth(this.monthIndex);
            },

            // 获取每月对应的天数
            getTotalDay() {
                let {month, year, isLeap} = this;
                let currentMonth = parseInt(month) < 10 ? '0' + parseInt(month) : String(month);

                if (currentMonth === '01' ||
                    currentMonth === '03' ||
                    currentMonth === '05' ||
                    currentMonth === '07' ||
                    currentMonth === '08' ||
                    currentMonth === '10' ||
                    currentMonth === '12') {
                    this.totalDay = 31;
                }
                else if (currentMonth === '04' ||
                    currentMonth === '06' ||
                    currentMonth === '09' ||
                    currentMonth === '11') {
                    this.totalDay = 30;
                }
                else if (currentMonth === '02' && isLeap(year)) {
                    this.totalDay = 29;
                }
                else {
                    this.totalDay = 28;
                }

                return this.totalDay;
            },

            // 获取每一类时间点的索引
            getDateIndex() {
                // 更新月对应的天数
                this.getTotalDay();

                let [year, month, day, hours] = this.dateValue.map(item => parseInt(item, 10));
                let {minYearVal, minMonthVal, minDayVal, minHoursVal, totalDay, type, hoursIndex} = this;
                let initMinYear = parseInt(minYearVal, 10);
                let initMinMonth = parseInt(minMonthVal, 10);
                let initMinDay = parseInt(minDayVal, 10);
                let initMinHours = parseInt(minHoursVal, 10);

                // 因为相减，所以不需要转Number类型

                this.yearIndex = year - initMinYear;

                // 当年回到最小年并且月小于最小月时，index为0
                if (year <= initMinYear && month <= initMinMonth) {
                    this.monthIndex = 0;
                    this.month = initMinMonth < 10 ? '0' + initMinMonth : initMinMonth;
                    this.dateValue[1] = this.month;
                }
                else {
                    this.monthIndex = month - initMinMonth;
                }

                // 避免出现 选中的是8月31日，在切换到6月时，出现空位现象。因为6月为30天，2月29/28天
                if (year <= initMinYear && day <= initMinDay) {
                    this.dayIndex = 0;
                    this.day = initMinDay < 10 ? '0' + initMinDay : initMinDay;
                    this.dateValue[2] = this.day;
                }
                else if (totalDay < day) {
                    this.dayIndex = day - initMinDay - (day - totalDay);
                }
                else {
                    this.dayIndex = day - initMinDay;
                }

                if (type === 'Y-M-D-H') {
                    let startHours = hours - minHoursVal;

                    if (year <= initMinYear && month <= initMinMonth && day <= initMinDay && startHours < 0) {
                        this.hoursIndex = 0;
                        this.hours = initMinHours < 10 ? '0' + initMinHours : initMinHours;
                        this.dateValue[3] = this.hours;
                    }
                    else if (year <= initMinYear && month <= initMinMonth && day > initMinDay && startHours < 0) {
                        this.hoursIndex = hoursIndex;
                    }
                    else {
                        this.hoursIndex = startHours;
                    }
                }
            },

            // 是否为闰年
            isLeap(year) {
                if ((year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0)) {
                    return true;
                }
                return false;
            },

            // 初始化年
            scrollInitYear(yearIndex) {
                //每个选项的高度
                let yearHeight = this.$refs.itemYear.clientHeight;

                this.scrollYear = new Scroll('#wrapper-year', {
                    //步长（每次滚动固定距离）
                    step: yearHeight,

                    // 列表默认位置(默认为0)
                    defaultPlace: yearHeight * yearIndex,

                    // 滚动结束回调函数
                    callback: (params) => {
                        let num = params.index + 2;

                        this.year = params.node[num].innerText.substr(0, 4);
                        this.dateValue[0] = this.year;
                    }
                });
            },

            // 初始化月
            scrollInitMonth(monthIndex) {
                //每个选项的高度
                let monthHeight = this.$refs.itemMonth.clientHeight;

                this.scrollMonth = new Scroll('#wrapper-month', {
                    //步长（每次滚动固定距离）
                    step: monthHeight,

                    // 列表默认位置(默认为0)
                    defaultPlace: monthHeight * monthIndex,

                    // 滚动结束回调函数
                    callback: (params) => {
                        let num = params.index + 2;

                        if (params.node[num]) {
                            this.month = params.node[num].innerText.substr(0, 2);
                            this.dateValue[1] = this.month;
                        }
                    }
                });
            },

            // 初始化日
            scrollInitDay(dayIndex) {
                //每个选项的高度
                let dayHeight = this.$refs.itemDay.clientHeight;

                this.scrollDay = new Scroll('#wrapper-day', {
                    //步长（每次滚动固定距离）
                    step: dayHeight,

                    // 列表默认位置(默认为0)
                    defaultPlace: dayHeight * dayIndex,

                    // 滚动结束回调函数
                    callback: (params) => {
                        let num = params.index + 2;

                        if (params.node[num]) {
                            this.day = params.node[num].innerText.substr(0, 2);
                            this.dateValue[2] = this.day;
                        }
                    }
                });
            },

            // 初始化时
            scrollInitHours(hoursIndex) {
                //每个选项的高度
                let hoursHeight = this.$refs.itemHours.clientHeight;

                this.scrollHours = new Scroll('#wrapper-hours', {
                    //步长（每次滚动固定距离）
                    step: hoursHeight,

                    // 列表默认位置(默认为0)
                    defaultPlace: hoursHeight * hoursIndex,

                    // 滚动结束回调函数
                    callback: (params) => {
                        let num = params.index + 2;

                        if (params.node[num]) {
                            this.hours = params.node[num].innerText.substr(0, 2);
                            this.dateValue[3] = this.hours;
                        }
                    }
                });
            }
        },
        watch: {
            year(val) {
                let curYear = parseInt(val, 10);
                let {minYear, month, minMonth, day, minDay, minHours, type} = this;

                this.minMonthVal = minMonth;
                this.minDayVal = minDay;
                this.minHoursVal = minHours;

                if (curYear > minYear) {
                    // 月、日从1开始 时从0开始
                    this.minMonthVal = '01';
                    this.minDayVal = '01';
                    this.minHoursVal = '00';
                }

                if (curYear <= minYear) {
                    this.minMonthVal = this.minMonth;
                    this.minDayVal = '01';
                    this.minHoursVal = '00';
                }

                if (curYear <= minYear && month <= minMonth) {
                    this.minDayVal = this.minDay;
                    this.minHoursVal = '00';
                }

                if (type === 'Y-M-D-H' && curYear <= minYear && month <= minMonth && day <= minDay) {
                    this.minHoursVal = this.minHours;
                }

                this.getDateIndex();

                // 更新月、日、时
                setTimeout(() => {
                    this.initScrollAll();
                }, 50);

                /**
                 *  每次更新加延时的目的是因为数据变化后，方法的执行总是先于计算属性的执行，
                 *  导致ul的高度没发生变化，但是li的数量重新渲染后变化了，所以导致高度和li总高度的不一致
                 */
            },
            month(val) {
                let curMonth = parseInt(val, 10);
                let {year, minYear, minMonth, day, minDay, minHours, type} = this;

                this.minDayVal = minDay;
                this.minHoursVal = minHours;

                if (year > minYear || curMonth > minMonth || day > minDay) {
                    // 日从1开始、时从0开始
                    this.minDayVal = '01';
                    this.minHoursVal = '00';
                }

                if (year <= minYear && curMonth <= minMonth) {
                    this.minDayVal = this.minDay;
                }

                if (type === 'Y-M-D-H' && year <= minYear && curMonth <= minMonth && day <= minDay) {
                    this.minHoursVal = this.minHours;
                }

                this.getDateIndex();

                // 更新日、时
                setTimeout(() => {
                    this.initScrollAll();
                }, 50);
            },
            day(val) {
                let curDay = parseInt(val, 10);
                let {year, minYear, month, minMonth, minDay, minHours} = this;

                this.minHoursVal = minHours;

                if (year > minYear || month > minMonth || curDay > minDay) {
                    this.minHoursVal = '00';
                }

                this.getDateIndex();

                // 更新小时
                setTimeout(() => {
                    this.initScrollAll();
                }, 50);
            }
        },
        destroyed() {
            this.scrollYear = this.scrollMonth = this.scrollDay = this.scrollHours = null;
        }
    }
</script>

<style scoped lang="scss">
    .common-date-picker {
        .date-picker {
            width: 100%;
            height: (526px);
            background-color: #fff;
            position: fixed;
            z-index: 1010;
            bottom: (-680px);
            left: 0;
            right: 0;
            transition: all .3s;
            color: #333;
            header {
                overflow: hidden;
                width: 100%;
                height: (95px);
                line-height: (95px);
                text-align: center;
                background: #F0F1F2;
                -webkit-box-shadow: 0 10px 10px -10px #333;
                -moz-box-shadow:0 10px 10px -10px #333;
                box-shadow: 0 10px 10px -10px #333;
                button {
                    font-size: (34px);
                    height: （95px）;
                    padding: 0 (30px);
                    border: none;
                    outline: none;
                    background: #F0F1F2;
                }
                h1 {
                    display: inline-block;
                    font-size: (34px);
                    font-weight: normal;
                }
                .fl {
                    float: left;
                }
                .fr {
                    float: right;
                    color: #3483FF;
                }
            }
            .ub {
                overflow: hidden;
                position: relative;
                height: (430px);
                text-align: center;
                display: flex;
                font-size: (40px);
                .year-list, .month-list, .day-list, .hours-list {
                    flex: 1;
                }
                ul {
                    li {
                        height: (86px);
                        line-height: (86px);
                        font-size: (40px);
                        color: #2A2B2C;
                        padding: 0 (10px) !important;
                        margin: 0!important;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
                .sel-mask {
                    width: 100%;
                    position: absolute;
                    left: 0;
                }
                .top {
                    top: 0;
                    height: (170px);
                    pointer-events: none;
                    background: rgba(255,255,255,0.72);
                }
                .bottom {
                    bottom: (-8px);
                    height: (170px);
                    pointer-events: none;
                    background: rgba(255,255,255,0.72);
                }
                .middle {
                    top: 50%;
                    height: (86px);
                    margin-top: (-43px);
                    pointer-events: none;
                    border-top: 1px solid #aaa;
                    border-bottom: 1px solid #aaa;
                }
            }
        }
        .show-date {
            bottom: 0;
        }
    }
</style>
