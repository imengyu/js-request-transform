# js-request-transform

## 文档

[https://docs.imengyu.top/js-request-transform/](https://docs.imengyu.top/js-request-transform/)

## 简介

这是一个为前端使用的数据模型转换层/序列化层。可将后端返回的数据进行统一转换，成为前端方便使用的数据类，同时，也支持提交前将前端的数据反向转换，变成后端可接受的数据。

这两步操作由库封装好，前端只需要配置好对象，就可以直接使用了，用起来无需多个繁琐的步骤。

在我们开发CURD页面时，经常会遇到下面这几种情况，使用本库，可以帮你解决这些烦人的问题：

* 后端返回的某些数据不能直接在组件中使用，需要在设置到组件之前做一次转换。例如，后端接口的某个日期字段，格式是 YYYY-MM-DD 的字符串，在使用组件库时，组件需要传入一个 `Date` 对象。那么在常规方法中，我们需要在请求数据之后，赋值表单之前，需要手动将所有日期字段转为Date，然后在提交数据之前将所有Date转为YYYY-MM-DD 的字符串，再提交，比较麻烦。

  > 遇到上面这些情况，我可以使用本库的类型转换功能，在请求后端数据之后，把需要的字段转为我需要的类型，可以转为预设类型，也可以自定义处理，也可以多步流水线处理。

* 后端返回的字段有拼写错误，例如把 `videoUrl` 写成 `vedioUrl` （后端英语垃圾），我有强迫症，必须把它改过来。
* 后端的字段都是胡乱写的，例如 `abc`, `x`, `y`, `dd`, `set`，如果直接在UI中引用，把我前端的UI相关代码字段弄得乱七八糟的，搞不清楚哪个字段是什么意思，后期维护起来看得眼花缭乱。
* 后端特别喜欢胡乱改字段名称，偏偏这个字段被多个界面引用。例如：有多个界面显示了某个接口的 someString 属性，假如某一天后端吧字段名称 someString 改成了 thatString，那么我们在界面显示的地方也需要修改名称。以上情况如果只是一处两处还好，如果有好多地方都需要修改，那就非常麻烦了

  > 遇到上面这些情况，我就可以使用本库的字段映射功能，我可以将后端不好或者修改的字段名称映射到我自己的字段名称，前端逻辑和UI只需要引用这个字段，提交的时候会自动转为源字段，这样前端的命名就不会和后端过于耦合，就可以把后端不好的命名和习惯隔离在外！

* 后端返回的数据结构不统一，例如一个资源的接收/提交格式不一致，需要转换。例如：后端在拉取资源时返回了这种数据格式
  ```
  {
    "someKey": { "value": 1 },
  }
  ```
  但是提交资源时需要这种数据格式
  ```
  {
    "someKey": 1,
  }
  ```

  > 遇到上面这种情况，我可以在本库的模型定义中自定义转换格式或者转换器，所有使用到这个资源的数据转换都在一处完成，无需在每个UI中手动写多次转换代码，将转换代码与UI解耦。

* 后端返回一个大结构数据时有些时候居然会缺了几个字段，造成页面显示异常，居然甩锅给前端！

  > 遇到上面这种情况，我可以在本库的模型定义中，增加严格检查，遇到后端不传某些字段或者字段异常时抛出错误，精准定位哪个字段丢失。

*（关于上面几种情况的解决方法，请参考下方使用案例）

因此，本库就是为解决这些问题所写的，他的主要功能是：**将数据转换单独抽离出来，可以统一在这里转换出结构清晰的数据供UI组件使用，而无需与UI组件耦合，无需再重复好几个地方写转换数据的代码**。

也可以用来方式习惯不好的后端干扰我们前端的开发，将不好的东西隔离在外面！

主要的建议用法是：将其与您的 request/fecth 请求封装在一起，在请求/提交时自动转换相关数据，这样就无需在调用界面时还需要每个地方手动转换。

## 特性

* 支持数据双向转换，可以将数据从服务端返回的格式 》转为》 前端所需要的格式，又在提交时 从前端格式 》转为》 服务端需要的格式。
* 支持多种字段类型的转换（字符串、数字、布尔值，Date，dayjs，数组，对象）。
* 支持自定义转换器。
* 支持多转换器流水线转换。
* 支持数组、对象嵌套转换。
* 支持字段名称映射。
* 支持检查数据字段是否存在缺失，这在大量数据缺失某些字段排查时非常有用。

希望此库可以为你的开发带来帮助！

## 安装

```
npm i -S @imengyu/js-request-transform
```

## 使用方法

你可以将其与您的 request/fecth 请求封装在一起，在请求/提交时自动转换相关数据，这样就无需在调用界面时还需要每个地方手动转换。

### 基础使用案例

下面这个案例演示了数据双向转换与接口封装的功能。

使用方法简要概括是：

1. 首先定义模型
    1. 对于接口返回的一个资源，例如产品、分类，你可以使用一个数据模型（DataModel）来描述，数据模型可以嵌套（对于多个相似子对象可以独立模型然后作为子字段引用）。
    2. 根据你的严格要求，设置不同的转换策略
        1. 如果你只需要转换几个字段，不考虑整体数据检查安全，可以使用默认的转换策略或者 warning 开头的转换策略
        2. 如果你对所有字段有严格要求，需要每个字段格式全部正确，不能有任何字段缺失，可以使用 strict 开头的转换策略
2. 定义转换表。你可以参考下方示例代码设置直接需要转换的字段。
3. 定义字段。如果需要 TypeScript 定义或者是默认值，你还需要在 DataModel 上定义字段以及默认值。
4. 编写接口，你可以参考下方示例代码在自己的接口中加入转换入口，将后端返回/前端上传字段进行转换。

```ts

import { DataModel, transformDataModel } from '@imengyu/js-request-transform';

//这是我的数据模型定义
// ShopProduct
//  - ShopProductDetail
//商品
export class ShopProduct extends DataModel {
  constructor() {
    super();
    /**
     * 设置转换策略，支持多个 策略以满足您的使用需求。
     * * default 默认模式（松散模式）：对于在转换表中定义的字段，进行转换，如果转换失败不会给出警告，未在表中定义的字段数据按原样返回。
     * * strict-required 全部严格模式：在转换表中的字段，进行转换，如果未定义或者转换失败，则抛出异常。未在表中定义的数据会被忽略，不会写入对象。
     * * strict-provided 仅提供字段严格模式：在转换表中的字段同 strict-required，未在表中定义的字段数据按原样返回。
     * * warning 仅警告：同 default，但会在转换失败时给出警告。
     * * warning-required 警告：同 strict-required，但会在转换失败时给出警告而不是异常。
     * * warning-provided 警告：同 strict-provided，但会在转换失败时给出警告而不是异常。
     */
    this._convertPolicy = 'default';
    //定义转换表
    this._convertTable = {
      category: {
        /**
         * 这里对 category 字段进行处理的目的同简介中的[情况2]，
         * 因为返回数据时是一个对象，提交时只有一个id，我们不希望与UI界面处理的地方过于耦合，
         * 所以对界面只使用统一的 category_id ，在提交时自动处理。
         */
        customToClientFn: (v: KeyValue) => {
          this.category_name = v?.name as string || '';
          this.category_id = v?.id as number || 0;
          return undefined;
        },
        serverSide: 'undefined',
      },
      category_id: { serverSide: 'number' },
      category_name: { serverSide: 'undefined' },//服务器端用不到我们单独设置的category_name
      name: { clientSide: 'string', serverSide: 'string' },
      description: { clientSide: 'array', serverSide: 'string' },
      //这是[情况1]的解决方案，对传入传出的日期进行转换，这样在表单组件中可以直接使用 数据.startSolidDate 数据.endSolidDate 来设置日期，无需再手动转换
      startSolidDate: { clientSide: 'dayjs'， serverSide: 'string', clientSideDateFormat: 'YYYY-MM-DD', serverSideDateFormat: 'YYYY-MM-DD' },
      endSolidDate: { clientSide: 'dayjs'， serverSide: 'string', clientSideDateFormat: 'YYYY-MM-DD', serverSideDateFormat: 'YYYY-MM-DD' },
      //这是嵌套数组对象的情况，在类型是 'array' 或者 'object' 时，只需要提供 clientSideChildDataModel，转换时会自动递归转换成对应的类型。
      details: { clientSide: 'array', clientSideChildDataModel: ShopProductDetail, serverSide: 'array' },
    };
  }

  //下方是设置一些默认值，通常是你在创建一个新对象时这个对象所带有的默认值，这配合表单很好用，就无需为表单手动设置默认值了。
  //同时，定义字段后会有类型提示。
  name = '';
  description = '';
  category_id = null as null|number;
  category_name = '';
  startSolidDate = dayjs();
  endSolidDate = dayjs();
  details = [] as ShopProductDetail[];
}
//商品详情
//下面是作者工作项目中的一个示例
export class ShopProductDetail extends DataModel {
  constructor() {
    super();
    this._convertPolicy = 'default';
    this._blackList.toServer.push(
      'level_names',
    );
    this._convertTable = {
      name: { clientSide: 'string', serverSide: 'string' },
      description: { clientSide: 'array', serverSide: 'string' },
      //同上的category字段，为了统一获取与提交，界面只使用 level_ids。
      levels: {
        customToClientFn: (v: KeyValue[]) => {
          this.level_names = v?.map(k => k.name as string) || [];
          this.level_ids = v?.map(k => k.id as number) || [];
          return undefined;
        },
        serverSide: 'undefined',
      },
      //这里是为了: 作者公司项目后端上传图片是不一样的，获取的时候是完整的 URL （例如https://xxxx.com/aaaaa.png）, 提交的时候是
      //相对路径 （例如/aaaaa.png），所以我这里需要这样处理，把路径中的host去掉。
      //当然，如果你的数据也有不满足要求的地方，你也可以参考这个写法自定义处理数据。
      images: {
        customToServerFn(source: string[]) { return source.map(k => removeUrlOrigin(k)); },
        customToClientFn(source) { return source }
      },
    };
  }

  name = '';
  description = '';
  images = [] as string[];
  level_names = [] as string[];
  level_ids = [] as number[];
}

//这是接口定义
export class ShopApi {
  /**
    * 获取商品信息
    * @param id 商品信息id
    * @returns 
    */
  getShopProduct(id: number) : Promise<ShopProduct> {
    return axios.get(`/product/${id}`)
      //使用 transformDataModel 将源json数据转为我们需要的对象
      .then((d) => transformDataModel(ShopProduct, d.data))；

      //也可直接创建对象后转换
      //.then((d) => {
      //  return new ShopProduct().fromServerSide(d.data);
      //})；
  }
  /**
    * 更新商品信息
    * @param id 商品信息id
    * @param info 商品信息对象
    * @returns 
    */
  updateShopProduct(id: number, info: ShopProduct) : Promise<void> {
    //使用 toServerSide 将对象转为服务器可接受的格式
    return axios.post(`/product/${id}`, info.toServerSide());
  }
}
```

在实际页面中调用, 这里使用了 vue3 和 ant-desgin-vue。这只是一个展示数据转换使用的 Demo ，实际上的表单比这个复杂的多。

```vue
<template>
  <a-form
    :model="formState"
    name="basic"
    :label-col="{ span: 8 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
    @finish="onFinish"
    @finishFailed="onFinishFailed"
  >
    <a-form-item
      label="名称"
      name="name"
      :rules="[{ required: true, message: '请输入名称' }]"
    >
      <a-input v-model:value="formState.name" />
    </a-form-item>
    <a-form-item name="date-picker" label="开始售卖日期">
      <a-date-picker v-model:value="formState.startSolidDate" />
    </a-form-item>
    <a-form-item name="date-picker" label="停止售卖日期">
      <a-date-picker v-model:value="formState.endSolidDate" />
    </a-form-item>

    <!--篇幅有限，其他表单项未显示-->

    <a-form-item :wrapper-col="{ offset: 8, span: 16 }">
      <a-button type="primary" html-type="submit">提交</a-button>
    </a-form-item>
  </a-form>
</template>

<script setup lang="ts">
import { defineComponent, reactive, onMounted } from 'vue';
import { useRoute } from 'vue-router'
import { ShopApi, ShopProduct } from 'api/ShopApi'; //ShopApi 就是上面的文件

const formState = ref<ShopProduct>(new ShopProduct());

const route = useRoute();
const id = parseInt(route.query.id as string);

//加载数据
onMounted(() => {
  ShopApi.getShopProduct(id).then((res) => {
    formState.value = res; //因为经过转换，返回的res类型直接就是 ShopProduct, 无需特殊处理，表单组件可以直接使用
  }).catch((e) => {
    console.error('Failed:', e);
  })

  //上面是加载数据的情况，你可以仅使用 new ShopProduct() ，用作添加数据时的默认值。
  //这样 formState 的值就是你在 ShopProduct 中设置的默认值，表单组件中的值也是你设置的默认值。
  //提交也是一样的。
})

//提交
const async onFinish = () => {
  //提交时同样也无需再写转换，因为转换已经在 ShopProduct 中完成
  try {
    await ShopApi.updateShopProduct(id, formState);
  } catch (e) {
    console.error('Failed:', e);
  }
};
const onFinishFailed = (errorInfo: any) => {
  console.error('Failed:', errorInfo);
};
</script>
```

### 类型转换功能

#### 基础类型转换

你可以在 _convertTable 中指定每个字段的转换目标格式，格式分为从服务端转为客户端（clientSide）和客户端转到服务端（serverSide）；
目标格式可以是内置的转换器，也可以是自定义注册的转换器。

```js
this._convertTable = {
  stringToBoolean: { clientSide: 'boolean', serverSide: 'string' },
  stringToDate: { clientSide: 'date', serverSide: 'string' },
}
```

#### 嵌套类型转换

字段可以是数组，数组中的元素可以是嵌套的模型对象。你只需要指定 `clientSideChildDataModel` 或者 `serverSideChildDataModel`，并
指定转换类型为 'array'，转换后目标字段中就是嵌套转换好的模型对象数组

```js
this._convertTable = {
  keys: {
    clientSide: 'array',
    clientSideChildDataModel: PlayScriptProcessNodeKeyFrame,
    serverSide: 'undefined',
    serverSideRequired: false,
  },
}
```

同理字段可以是子对象，同样会为你自动嵌套转换好。

```js
this._convertTable = {
  key: {
    clientSide: 'array',
    clientSideChildDataModel: ChildDataModel,
    serverSide: 'undefined',
    serverSideRequired: false,
  },
}
```

#### 多转换器

一个字段可以由多个转换器逐步转换，这可以实现很多功能。例如下方示例先将输入的字符串转为 Date 对象，
如果转换失败或者源对象未提供，则调用 addDefaultValue 默认转换器添加默认值。

* addDefaultValue 处于多转换器数组第一个时，字段空预检会跳过。

```ts
this._convertTable = {
  createDate: [
    {
      clientSide: 'date',
    },
    {
      clientSide: 'addDefaultValue',
      clientSideParam: {
        defaultValue: new Date(),
      } as ConverterAddDefaultValueParams
    },
  ],
}
```

#### 回调指定转换器

当多个字段都要使用相同的转换配置时，一个个在 `_convertTable` 中指定会比较麻烦，
因此提供了 `_convertKeyType` 回调用于根据字段名称批量返回转换配置功能。

```ts
this._convertKeyType = (key, direction) => {
  if (direction === 'client' && key.startsWith('date')) {
    return {
      clientSide: 'date', serverSide: 'string'
    }
  }
};
```

#### 自定义转换器

你可以注册自己的转换器步骤，实现更多的功能。

例如，下方是一个将数值乘或者除指定倍数的转换器（已内置到库中），他满足了后端数据与前端UI组件显示数值倍数不一样的问题。

```ts
import { DataConverter } from '';

DataConverter.registerConverter({
  targetType: 'multiple',
  key: 'Multiple',
  converter(source, key, type, childDataModel, dateFormat, required, _params, options, debugKey, debugName)  {
    const params = _params as unknown as ConverterMultipleParams;
    return DataConverter.makeSuccessConvertResult(params.type === 'divide' ? 
      (source as number / params.multiple) :
      (source as number * params.multiple)
    );
  },
});

```

### 字段映射功能

字段映射功能用于将后端的字段映射到前端自己写的、语义明确的字段名上面。

可以使用 `_nameMapperServer` 或者 `_nameMapperClient` 设置单个方向的名称映射。

```ts
this._nameMapperServer = {
  'ename': 'eventName',
};
```

也可以使用 `setNameMapper` 函数设置双向的转换。

```ts
this.setNameMapper({
  'ename': 'eventName',
});
```

### 严格检查功能

你可以设置严格模式，用于严格字段检查和转换。在严格模式下会检查缺失的字段，或者传入类型不正确的字段。

* strict-required 全部严格模式：在转换表中的字段，进行转换，如果未定义或者转换失败，则抛出异常。未在表中定义的数据会被忽略，不会写入对象。
* strict-provided 仅提供字段严格模式：在转换表中的字段同 strict-required，未在表中定义的字段数据按原样返回。

```ts
this._convertPolicy = 'strict-required';
```

### 自定义转换功能

有多个回调函数允许进行自定义转换。

```ts
export class ShopProductDetail extends DataModel {
  constructor() {
    super();
    this._convertPolicy = 'default';
    this._blackList.toServer.push(
      'level_names',
    );
    this._convertTable = {
      name: { clientSide: 'string', serverSide: 'string' },
      description: { clientSide: 'array', serverSide: 'string' },
      //同上的category字段，为了统一获取与提交，界面只使用 level_ids。
      levels: {
        customToClientFn: (v: KeyValue[]) => {
          this.level_names = v?.map(k => k.name as string) || [];
          this.level_ids = v?.map(k => k.id as number) || [];
          return undefined;
        },
        serverSide: 'undefined',
      },
      //这里是为了: 作者公司项目后端上传图片是不一样的，获取的时候是完整的 URL （例如https://xxxx.com/aaaaa.png）, 提交的时候是
      //相对路径 （例如/aaaaa.png），所以我这里需要这样处理，把路径中的host去掉。
      //当然，如果你的数据也有不满足要求的地方，你也可以参考这个写法自定义处理数据。
      images: {
        customToServerFn(source: string[]) { return source.map(k => removeUrlOrigin(k)); },
        customToClientFn(source) { return source }
      },
    };
  }

  name = '';
  description = '';
  images = [] as string[];
  level_names = [] as string[];
  level_ids = [] as number[];
}
```

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

|参数|说明|类型|默认值|
|--|--|--|--|
|serverSide|指定当前key转为服务端的数据类型|string|
|serverSideRequired|指定当前key是否是必填，逻辑如图同 _convertPolicy 设置为 `*-required` 时。|boolean|
|serverSideDateFormat|当前key类型是dayjs时，自定义日期格式|string|
|serverSideChildDataModel|当 serverSide 为 array/object 时，子项目要转换成的类型|`(new () => DataModel)`or`string`|
|customToServerFn|自定义前端至服务端转换函数，指定此函数后 serverSide 属性无效|DataConvertCustomFn|
|clientSide|指定当前key是否是必填，逻辑如图同 _convertPolicy 设置为 `*-required` 时。|boolean|
|clientSideRequired|指定当前key转为前端时的数据类型|string|
|clientSideDateFormat|当前key类型是dayjs时，自定义日期格式|string|
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

##### configDayJsTimeZone

设置 dayjs 默认时区

参考 https://dayjs.gitee.io/docs/zh-CN/plugin/timezone

|参数|说明|类型|默认值|
|--|--|--|--|
|timezone|时区名称|string|-|

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
* dayjs 转换为dayjs对象。
* addDefaultValue 用于当转换值为空时添加默认值，参数类型定义是 `ConverterAddDefaultValueParams` ，取消注册键值是 `AddDefaultValue`。
* multiple 乘或者除倍数转换器，参数类型定义是 `ConverterMultipleParams` ，取消注册键值是 `Multiple`。
