
## 基于Vue2.x的移动端滑动时间组件。

### 支持个性化定制，可以限制最小年、月、日、时；可扩展性强。


## Usage
```html
 <date-picker @getDateValue="getDateValue" :showDatePicker="show"></date-picker>
```

### props属性说明

|Property|type|require|default|description|
|---|---|---|---|---|
|showDatePicker|Boolean|false|false|是否显示datepicker|
|title|String|false|请选择日期|组件标题|
|minYear|Number, String|false|1950|起始年|
|maxYear|Number, String|false|当前年之后的20年|最大年|
|minMonth|Number, String|false|最小月份，前提是年必须是当前年|最小月|
|minDay|Number, String|false|最小日，前提是最小年和最小月|最小日|
|minHours|Number, String|false|最小时，前提是最小年和最小月、最小日|最大年份|
|defaultValue|Array|false|[2018, 5, 4, 12]|默认值|


### Method

|Method|type|parameter|return|description|
|---|---|---|---|---|
|getDateValue|||undefined|自定义事件，接收值。|


```js
// 自定义事件
getDateValue(value) {
    // value 为数组，每一项分别对应 年、月、日、时
    this.show = false;
    this.dateValue = value;
}
```

### 更新日志

* 版本：0.0.1，日期：2018/08/09，描述：创建文档

### 维护人员

cuiliangliang
