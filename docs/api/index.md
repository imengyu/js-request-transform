## API 参考

### 接口参考

#### DataModel

##### 实例属性

|参数|说明|类型|默认值|
|--|--|--|--|
|_dontSendToServerIfEmpty|设置是否 子字段参数为空，则不传值至服务器|boolean|false|
|_afterSolveServer|从服务端转换后的后处理回调|function|-|
|_afterSolveClient|从本地端转换后的后处理回调。data 是最终转为服务器端的数据，可自由修改。|(data: KeyValue) => void|-|
|_defaultDateFormat|统一设置默认的日期格式|string|-|
|_convertTable|数据字段转换表。key类中的为属性名称，值是转换信息。|`Record&lt;string,DataConvertItem&gt;` |-|
|_convertKeyType|自定义字段转换类型，这在对象的属性个数不确定时很有用。此函数返回的类型优先级比 _convertTable 高。|`(key: string, direction: ConverterDataDirection) => DataConvertItem`|-|
|_nameMapperServer|字段的名称映射表(服务端至客户端)，左边是服务端名称，右边是客户端名称。效果：服务端字段是 a ，客户端转换 a 之后会把它 赋值到名称为 b 的属性。|`{ [index: string]: string }`|-|
|_nameMapperClient|字段的名称映射表(客户端至服务端)，左边是客户端名称，右边是名称服务端。效果：客户端字段是 a ，转换 a 到服务端数据之后会把它 赋值到名称为 b 的属性。|`{ [index: string]: string }`|-|
|_convertPolicy|转换策略。|`ConvertPolicy`|-|
|_blackList|字段黑名单表。黑名单中的字段不会被转换也不会被拷贝至目标中。分为：到服务器的黑名单与到前端的黑名单|`{ toServer: string[] toClient: string[] }`|-|
|_lastServerSideData|获取上次创建的服务端原始数据|`ConvertPolicy`|-|

##### 实例方法

###### getLastServerSideData() : KeyValue|null

同 _lastServerSideData，但此函数会创建一个克隆版本。

###### keyValue() : KeyValue

获取模型数据为纯JSON（不包括隐藏属性，函数等）。

###### rawData() : KeyValue|null

同 getLastServerSideData。

###### fromServerSide(data : KeyValue|null|undefined, nameKeySup?: string) : DataModel

从服务端数据创建前端使用的数据模型。

|参数|说明|类型|默认值|
|--|--|--|--|
|data|服务端数据|`KeyValue`or`null`or`undefined`|-|
|nameKeySup|键值前缀，用于调试|`string`|-|

###### toServerSide(nameKeySup?: string) : DataModel

转换当前数据模型为服务端格式。

|参数|说明|类型|默认值|
|--|--|--|--|
|nameKeySup|键值前缀，用于调试|`string`|-|

###### clone()

克隆一份。

###### set(key: string, value: unknown)

在实例上通过字符串设置或增加对象中的属性。

访问路径支持：

* 支持点 “.” 表示子级属性。
* 支持数组 “[x]” 表示数组的第 x 个数据。

例如：a.listData[0].title

|参数|说明|类型|默认值|
|--|--|--|--|
|key|访问路径|`string`|-|
|value|值|`unknown`|-|

###### get(key: string, defaultValue?: unknown): unknown

在实例上获取属性。

访问路径支持：

* 支持点 “.” 表示子级属性。
* 支持数组 “[x]” 表示数组的第 x 个数据。

|参数|说明|类型|默认值|
|--|--|--|--|
|key|访问路径|`string`|-|
|defaultValue|默认值|`unknown`|-|

##### 转换表

转换表 _convertTable 的 key 是属性的名称，value 是转换数据：DataConvertItem

DataConvertItem：

|参数|说明|类型|
|--|--|--|
|serverSide|指定当前key转为服务端的数据类型|string|
|serverSideRequired|指定当前key是否是必填，逻辑如图同 _convertPolicy 设置为 `*-required` 时。|boolean|
|serverSideDateFormat|当前key类型是date时，自定义日期格式|string|
|serverSideChildDataModel|当 serverSide 为 array/object 时，子项目要转换成的类型|`(new () => DataModel)`or`string`|
|customToServerFn|自定义前端至服务端转换函数，指定此函数后 serverSide 属性无效|DataConvertCustomFn|
|clientSide|指定当前key是否是必填，逻辑如图同 _convertPolicy 设置为 `*-required` 时。|boolean|
|clientSideRequired|指定当前key转为前端时的数据类型|string|
|clientSideDateFormat|当前key类型是date时，自定义日期格式|string|
|serverSideChildDataModel|当 clientSide 为 array/object 时，子项目要转换成的类型|`(new () => DataModel)`or`string`|
|customToClientFn|自定义服务端至前端转换函数，指定此函数后 clientSide 属性无效|DataConvertCustomFn|
|forceApply|设置强制转换字段名。默认情况下源数据中没有的字段不会调用转换器，如果你需要为不存在的字段设置默认值或者调用指定自定义转换器，可以使用此功能强制调用转换器，搭配 addDefaultValue 转换器。为字段设置转换器。当处于数组转换器中时，只判断第一个的 forceApply 值。默认：false|`boolean`or`undefined`|

##### DataConvertCustomFn

|参数|说明|类型|默认值|
|--|--|--|--|
|source|源数据|unknown|-|
|item|当前转换表条目|DataConvertItem|-|
|source|其他参数|ConvertItemOptions|-|
|返回|转换完成的数据|unknown|-|

##### ConvertPolicy

转换模式

* default 默认模式（松散模式）：对于在转换表中定义的字段，进行转换，如果转换失败不会给出警告，未在表中定义的字段数据按原样返回。
* strict-required 全部严格模式：在转换表中的字段，进行转换，如果未定义或者转换失败，则抛出异常。未在表中定义的数据会被忽略，不会写入结果。
* strict-provided 仅提供字段严格模式：在转换表中的字段同 strict-required，未在表中定义的字段数据按原样返回。
* warning 仅警告：同 default，但会在转换失败时给出警告。
* warning-required 警告：同 strict-required，但会在转换失败时给出警告而不是异常。
* warning-provided 警告：同 strict-provided，但会在转换失败时给出警告而不是异常。

#### DataConverter

转换器构建方法。

##### registerConverter

注册一个自定义数据转换器。

支持注册自定义类型转换器，在转换一个字段时，会依次调用转换器，如果有一个转换器转换成功，则停止转换。先注册的优先级最高。

|参数|说明|类型|默认值|
|--|--|--|--|
|config|转换器数据|ConverterConfig|-|

##### ConverterConfig

|参数|说明|类型|默认值|必填|
|--|--|--|--|--|
|targetType|当前转换器所接受的源数据类型|string|-|是|
|key|唯一键值，用于取消注册，不提供的话则无法移除。|string|-|-|
|preRequireCheckd|当转换策略是必填时，此回调用于自定义类型检测是否提供。|function|-|是|
|converter|转换器主体函数|ConverterHandler|-|是|

##### preRequireCheckd 回调定义

|参数|说明|类型|
|--|--|--|
|source|源数据|unknown|
|返回|返回为 undefined 时表示无错误，其他情况表示错误信息|unknown|

##### ConverterHandler 定义

|参数|说明|类型|
|--|--|--|
|source|源数据|unknown|
|key|当前处理数据的完整键值，用于调试|string|
|type|转换类型|string|
|childDataModel|子数据的类型|`(new () => DataModel)`or`string`or`null`or`undefined`|
|dateFormat|当前字段的日期格式，可能为空，为空时可使用 `options.defaultDateFormat`|string|
|required|是否有必填标志|boolean|
|options|其他附加属性|ConvertItemOptions|

##### ConvertItemOptions

|参数|说明|类型|
|--|--|--|
|direction|当前模型的转换方向|ConverterDataDirection|
|defaultDateFormat|当前模型的默认日期格式|string|
|policy|当前模型的转换策略|ConvertPolicy|

##### unregisterConverter

取消注册指定的数据转换器

|参数|说明|类型|默认值|
|--|--|--|--|
|key|转换器注册时提供的key|string|-|
|targetType|转换器目标类型|string|-|

##### makeSuccessConvertResult

在自定义转换器中返回成功结果。

|参数|说明|类型|默认值|必填|
|--|--|--|--|--|
|res|返回结果|unknown|-|是|

##### makeFailConvertResult

在自定义转换器中返回失败结果。

|参数|说明|类型|默认值|必填|
|--|--|--|--|--|
|error|错误信息|`string` or `Error`|-|否|

#### transformDataModel

用于从服务端转为客户端数据，同 `new DataModel().fromServerSide(source)`。

|参数|说明|类型|默认值|
|--|--|--|--|
|c|需要转换的目标类型|`(new () => T) or FastTemplateDataModelDefine`|-|
|source|源数组|`KeyValue`|-|
|userOptions|源数组|`其他转换自定义配置`|-|

返回：`T`

#### transformArrayDataModel

用于从服务端转为客户端数据，将数组转为模型数组。

|参数|说明|类型|默认值|
|--|--|--|--|
|c|需要转换的目标类型|`new () => T`|-|
|source|源数组|`KeyValue[]`|-|
|userOptions|源数组|`其他转换自定义配置`|-|

返回：`T[]`

#### transformWithConverter

用于从服务端转为客户端数据，将JSON数据根据转换器名称转为指定数据模型或者基本类型。

|参数|说明|类型|默认值|
|--|--|--|--|
|converterName|转换器名称|`string`|-|
|source|源数据实例|`any`|-|
|sourceKeyName|标识数据名称，用于异常显示|`string`|`'root'`|
|arrayChildDataModel|当是数组或者集合等嵌套对象时，指定子对象的数据类型|`ChildDataModel`|`undefined`|
|defaultDateFormat|默认日期格式|`string`|`'YYYY-MM-DD HH:mm:ss'`|
|defaultConvertPolicy|默认转换策略|`ConvertPolicy`|`'strict-required'`|
|userOptions|源数组|`其他转换自定义配置`|-|

### 内置转换类型定义

这些内置注册都可以取消注册，除特殊说明，他们的键值是 Default[TypeName] ，例如 undefined 的取消注册键值是 `DefaultUndefined`。

* undefined 相当于黑名单，永远都会转换为 `undefined` 。
* null 强制转换为 `null` 。
* string 转换为字符串。
* number 转换为数字类型。
* boolean 转换为布尔值类型。
* object 转换为对象。
  可以指定 `clientSideChildDataModel` 或者 `serverSideChildDataModel` 来指定此对象要强制转为那个数据模型。
  如果源对象是空数组，则转换为 `null`，其他类型无法转换。
* array 转换为数组，源对象必须是数组类型。
   可以指定 `clientSideChildDataModel` 或者 `serverSideChildDataModel` 来指定此数组的每个子条目要强制转为那个数据模型。
* date 转换为 `Date`。
  * 如果输入是字符串，则会尝试使用日期格式进行转换。
  * 如果输入是数值时间戳，则会使用 `new Date(time)` 进行转换。
* json 转换为JSON数组，不进行内置递归对象处理。
* date 转换为 `Date` 对象。
* addDefaultValue 用于当转换值为空时添加默认值，参数类型定义是 `ConverterAddDefaultValueParams` ，取消注册键值是 `AddDefaultValue`。
* multiple 乘或者除倍数转换器，参数类型定义是 `ConverterMultipleParams` ，取消注册键值是 `Multiple`。
