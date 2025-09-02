<template>
  <div class="d-flex flex-column">
    <h3>JSON数据转数据模型属性类</h3>
    <div class="p-3 border bg-grey">
        用法：
      <ul>
        <li>这个工具用于转换接口返回的JSON数据为 DataModel 写法。</li>
        <li>您可以把想转换的接口请求 JSON 结果，复制粘贴到下面的 {} 中，点击转换 (注意json格式，结尾不要逗号)。</li>
        <li>结果可以复制字段到 DataModel 中，保存即可。</li>
        <li>结果下面可能会附带写了额外的子数据转换，用于一些对象字段转换，您可复制到 DataModel 的 _convertTable 中，保存即可。</li>
      </ul>
    </div>
    <div class="d-flex border flex-row">
      <codemirror
        v-model="source"
        placeholder="源JSON"
        :style="{ height: '500px', width: '50%', backgroundColor: '#fff' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
      />
      <codemirror
        v-model="target"
        placeholder="Class格式变量"
        :style="{ height: '500px', width: '50%', backgroundColor: '#fff' }"
        :autofocus="true"
        :indent-with-tab="true"
        :tab-size="2"
        :extensions="extensions"
      />
    </div>
    <div class="d-flex p-3 flex-row justify-content-end align-item-center">
      <span class="mr-3">转换为：</span>
      <RadioGroup v-model:value="caseType">
        <Radio value="Default">Default</Radio>
        <Radio value="Camel">Camel</Radio>
        <Radio value="Pascal">Pascal</Radio>
        <Radio value="Snake">Snake</Radio>
        <Radio value="Midline">Midline</Radio>
      </RadioGroup>
      <Button type="primary" @click="handleConvert">转换</Button>
      <Button @click="handleCopy">复制</Button>
      <Button @click="handleReset">重置</Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { message, Button, RadioGroup, Radio } from 'ant-design-vue';
import { Codemirror } from 'vue-codemirror';
import { json } from '@codemirror/lang-json';
import { ref } from 'vue';
import { DataStringUtils, type NameMapperCase } from '../../src'
import Clipboard from 'vue-clipboard3'

const extensions = [json()];
const clipboard = Clipboard()
const source = ref('{\n\n}')
const target = ref('');
const caseType = ref('Default');

const preferNumberKeys = [
  'id', 'count', 'amount', 'price', 'total', 'number', 'size', 'length', 'width', 'height', 'weight', 'volume',
  'quantity', 'price', 'total', 'size', 'length', 'width', 'height', 'weight', 'volume'
];
const preferStringKeys = [
  'name', 'title', 'description', 'content', 'text', 'email', 'phone', 'address', 'city', 'state', 'country', 'intro',
  'zip', 'username', 'password', 'token', 'secret', 'key', 'image', 'keyword', 'video', 'audio',
];
const preferBooleanKeys = [
  'is', 'has', 'visible', 'enabled', 'active', 'checked', 'selected', 'required', 'valid', 'invalid', 'visible', 'hidden', 
  'disabled', 'enabled', 'active', 'checked', 'selected', 'required', 'valid', 'invalid'
];
   
const dateRegrex = [
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
  /^\d{2}\/\d{2}\/\d{4}$/,
  /^\d{4}-\d{2}-\d{2}$/,
  /^\d{4}-\d{2}-\d{2}\d{2}:\d{2}:\d{2}$/,
];
function isNumberString(str: string) {
  return /^\d+$/.test(str);
}
function matchDateRegrex(dateStr: string) {
  for (const regrex of dateRegrex) {
    if (regrex.test(dateStr))
      return true;
  }
  return false;
}
function matchStringArr(str: string, arr: string[]) {
  if (str.includes('_')) {
    const arr = str.split('_');
    for (const item of arr) {
      if (matchStringArr(item, arr))
        return true;
    }
  }
  for (const item of arr) {
    if (str.includes(item))
      return true;
  }
  return false;
}
function matchTypeFromKeyName(keyLowerCase: string) {
  if (matchStringArr(keyLowerCase, preferStringKeys))
    return 'string';
  if (matchStringArr(keyLowerCase, preferNumberKeys))
    return 'number';
  if (matchStringArr(keyLowerCase, preferBooleanKeys))
    return 'boolean';
  return '';
}
function matchChildType(arr: unknown[]) {
  if (arr.length > 0) {
    if (typeof arr[0] === 'string')
      return 'string';
    else if (typeof arr[0] === 'number')
      return 'number';
    else if (typeof arr[0] === 'boolean')
      return 'boolean';
  }
  return '';
}

type PreferTypes = 'string'|'number'|'boolean'|'object'|'array'|'';

function handleConvert() {
  try {
    const resultArr = [] as string[];
    const convertArr = [] as string[];
    const jsonObj = JSON.parse(source.value);
    for (const key in jsonObj) {
      if (Object.prototype.hasOwnProperty.call(jsonObj, key)) {

        let convertTableSimpleType = '';
        let convertTableSimpleServerType = '';
        let preferUseType : PreferTypes = '';
        let preferUseTypeChild : PreferTypes = '';
        let resultIsNull = false;
        const element = jsonObj[key];
        const keyLowerCase = key.toLowerCase();
        const keyResult = caseType.value === 'Default'? key : DataStringUtils.covertStringToCase(caseType.value as NameMapperCase, key);

        if (element === null) {
          preferUseType = matchTypeFromKeyName(keyLowerCase);
          resultIsNull = true;
        } else if (typeof element === 'string') {

          if (element && element.startsWith('[') && element.endsWith(']')) {
            preferUseType = 'array';
            const arr = JSON.parse(element);
            preferUseTypeChild = matchChildType(arr) || matchTypeFromKeyName(keyLowerCase);
          } else if (isNumberString(element)) {
            preferUseType = 'number';
            preferUseTypeChild = 'number';
          } else {
            preferUseType = 'string';
            preferUseTypeChild = 'string';
          }
        } else if (typeof element === 'number') {
          preferUseType = 'number';
          preferUseTypeChild = 'number';
        } else if (typeof element === 'boolean') {
          preferUseType = 'boolean';
          preferUseTypeChild = 'boolean';
        } else if (typeof element === 'object') {
          preferUseType = 'object';
          preferUseTypeChild = 'object';

          if (element instanceof Array) {
            preferUseType = 'array';
            preferUseTypeChild = matchChildType(element);
          }
        }


        
        if (preferUseType === 'string') {
          if (element && matchDateRegrex(element)) {
            resultArr.push(`${keyResult} = new Date();`)
            convertTableSimpleType = 'Date';
            convertTableSimpleServerType = 'Date';
          } else {
            resultArr.push(`${keyResult} = '' as string${resultIsNull ? '|null' : ''};`)
            convertTableSimpleType = 'string';
            convertTableSimpleServerType = 'string';
          }
        } else if (preferUseType === 'number') {
          resultArr.push(`${keyResult} = ${resultIsNull ? 'null' : '0'} as number${resultIsNull ? '|null' : ''};`)
          convertTableSimpleType = 'number';
          convertTableSimpleServerType = 'number';
        } else if (preferUseType === 'boolean') {
          resultArr.push(`${keyResult} = false;`)
          convertTableSimpleType = 'boolean';
          convertTableSimpleServerType = 'boolean';
        } else if (preferUseType === 'object' || preferUseType === 'array') {

          if (preferUseType === 'array' || element instanceof Array) {

            if (preferUseTypeChild === 'string')
              resultArr.push(`${keyResult} = [] as string[];`)
            else if (preferUseTypeChild === 'number')
              resultArr.push(`${keyResult} = [] as number[];`)
            else if (preferUseTypeChild === 'boolean')
              resultArr.push(`${keyResult} = [] as boolean[];`)
            else
              resultArr.push(`${keyResult} = [] as unknow[];`)

          } else {
            const convertArrTemp = [];
            let hasValue = null;
            for (const key2 in element) {
              if (Object.prototype.hasOwnProperty.call(element, key2)) {
                const element2 = element[key2];

                const preKey = key2 === 'value' ? key : `${key}_${key2}`;
                const preKeyResult = caseType.value === 'Default'? preKey : DataStringUtils.covertStringToCase(caseType.value as NameMapperCase, preKey);
              
                if (typeof element2 === 'string') {
                  resultArr.push(`${preKeyResult} = '';`);
                  convertArrTemp.push(`${preKeyResult} = v?.${key2} as string || '';`);
                  if (key2 === 'value')
                    hasValue = `return v?.${key2} as string || '';`;
                }
                else if (typeof element2 === 'number') {
                  resultArr.push(`${preKeyResult} = null as number|null;`);
                  convertArrTemp.push(`${preKeyResult} = v?.${key2} as number || 0;`);
                  if (key2 === 'value')
                    hasValue = `return v?.${key2} as number || 0;`;
                }
                else if (typeof element2 === 'boolean') {
                  resultArr.push(`${preKeyResult} = false;`);
                  convertArrTemp.push(`${preKeyResult} = v?.${key2} as boolean;`);
                  if (key2 === 'value')
                    hasValue = `return v?.${key2} as boolean;`;
                }

              }
            }

            convertArr.push(`${keyResult}: {
  customToClientFn: (v: KeyValue) => {
    ${convertArrTemp.join('\n')}
    ${hasValue?hasValue:'return v;'}
  },
  serverSide: ${hasValue?'number':'undefined'},
},`)
          }
        }

        if (convertTableSimpleType && convertTableSimpleType !== convertTableSimpleServerType) {
          convertArr.push(`${keyResult}: { clientSide: '${convertTableSimpleType}',  serverSide: '${convertTableSimpleServerType}' },`)
        }
      }
    }

    target.value = resultArr.join('\n');

    if (convertArr.length > 0)
      target.value += '\n\n额外的子数据转换：\n' + convertArr.join('\n');
    
  } catch(e) {
    target.value = '' + e;
  }
}
function handleReset() {
  source.value = '{\n\n}';
  target.value = '';
}
function handleCopy() {
  clipboard.toClipboard(target.value);
  message.success('复制成功！')
}
</script>

<style scoped>
.d-flex {
  display: flex;
}
.flex-row {
  flex-direction: row;
}
.flex-column {
  flex-direction: column;
}
.justify-content-end {
  justify-content: flex-end;
}
.align-item-center {
  align-items: center;
}
.border {
  border: 1px solid #ccc;
}
.bg-grey {
  background-color: #f0f0f0;
}
.p-3 {
  padding: 10px;
}
.mr-3 {
  margin-right: 10px;
}
.m-3 {
  margin: 10px;
}
.h-500 {
  height: 500px;
}
.w-50 {
  width: 50%;
}
.bg-white {
  background-color: #fff; 
}
</style>
