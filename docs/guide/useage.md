---
title: 如何使用
order: 2
---

# 使用方法

你可以将其与您的 request/fecth 请求封装在一起，在请求/提交时自动转换相关数据，这样就无需在调用界面时还需要每个地方手动转换。

## 基础使用案例

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

## 类型转换功能

## 基础类型转换

你可以在 _convertTable 中指定每个字段的转换目标格式，格式分为从服务端转为客户端（clientSide）和客户端转到服务端（serverSide）；
目标格式可以是内置的转换器，也可以是自定义注册的转换器。

```js
this._convertTable = {
  stringToBoolean: { clientSide: 'boolean', serverSide: 'string' },
  stringToDate: { clientSide: 'date', serverSide: 'string' },
}
```

## 嵌套类型转换

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

## 多转换器

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

## 回调指定转换器

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

## 自定义转换器

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

## 字段映射功能

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

## 严格检查功能

你可以设置严格模式，用于严格字段检查和转换。在严格模式下会检查缺失的字段，或者传入类型不正确的字段。

* strict-required 全部严格模式：在转换表中的字段，进行转换，如果未定义或者转换失败，则抛出异常。未在表中定义的数据会被忽略，不会写入对象。
* strict-provided 仅提供字段严格模式：在转换表中的字段同 strict-required，未在表中定义的字段数据按原样返回。

```ts
this._convertPolicy = 'strict-required';
```

## 自定义转换功能

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

## 实用函数

### findOneProp - 在对象中根据条件查找属性值

**函数签名：**
```typescript
export function findOneProp(source: Record<string, any>, matchConditions: FindOnePropCondition[], assertMessage?: string): any
```

**功能说明：**
在一个对象中根据匹配条件查找一个属性值。可以根据不同的匹配类型来查找属性，支持以下匹配类型：
- `match`：精确匹配属性名
- `startWith`：匹配以指定字符串开头的属性名
- `endWith`：匹配以指定字符串结尾的属性名
- `contain`：匹配包含指定字符串的属性名
- `selectOnlyOne`：如果只有一个属性，直接返回该属性值
- `selectAtLestOne`：如果没有匹配到任何属性，返回第一个属性值

**参数说明：**
- `source`：源对象
- `matchConditions`：匹配条件数组
- `assertMessage`：可选，断言失败时的错误信息

**使用示例：**
```typescript
// 精确匹配
const result = findOneProp({ name: 'test' }, [{ type: 'match', name: 'name' }]); // 'test'

// 匹配以指定字符串开头的属性
const result = findOneProp({ user_name: 'test' }, [{ type: 'startWith', name: 'user' }]); // 'test'

// 匹配以指定字符串结尾的属性
const result = findOneProp({ name_id: '123' }, [{ type: 'endWith', name: 'id' }]); // '123'
```

### findOneBestArray - 递归查找最匹配的列表数组

**函数签名：**
```typescript
export function findOneBestArray(source: Record<string, any>): any[]
```

**功能说明：**
在一个对象中递归查找最可能的列表数组并返回。该函数会遍历所有属性值，并返回第一个匹配到的列表数组。数组的合理性判断标准是：数组中超过80%的元素具有相同的类型。

**参数说明：**
- `source`：源对象

**使用示例：**
```typescript
const data = {
  code: 200,
  data: {
    list: [{ id: 1, name: 'test1' }, { id: 2, name: 'test2' }],
    total: 2
  }
};

const result = findOneBestArray(data); // [{ id: 1, name: 'test1' }, { id: 2, name: 'test2' }]
```

### transformAnyToArray - 将任意类型转换为数组

**函数签名：**
```typescript
export function transformAnyToArray(source: unknown, options?: { nestArray?: boolean }): any[]
```

**功能说明：**
将任意类型的数据转换为数组类型，支持以下转换规则：
- 如果源数据是数组类型，则直接返回源数据
- 如果源数据是对象/Map类型，则返回对象的所有属性值组成的数组
- 如果数据是字符串，尝试将其转换为JSON对象，如果成功则继续处理转换后的结果
- 如果源数据是基本类型，则返回包含源数据的单数组
- 如果源数据是null或undefined，则返回空数组

**参数说明：**
- `source`：任意类型的源数据
- `options`：可选配置项
  - `nestArray`：是否递归查找嵌套数组，默认值为true

**使用示例：**
```typescript
// 转换数组
transformAnyToArray([1, 2, 3]); // [1, 2, 3]

// 转换对象
transformAnyToArray({ a: 1, b: 2 }); // [1, 2]

// 转换JSON字符串
transformAnyToArray('[1, 2, 3]'); // [1, 2, 3]
transformAnyToArray('{"a": 1, "b": 2}'); // [1, 2]

// 转换基本类型
transformAnyToArray('test'); // ['test']
transformAnyToArray(123); // [123]
transformAnyToArray(true); // [true]

// 转换null或undefined
transformAnyToArray(null); // []
transformAnyToArray(undefined); // []
```

## 转换工具

这里有一个[转换工具](https://docs.imengyu.top/js-request-transform/converter)，你可以使用它通过json快速生成DataModel字段，方便前端使用。
