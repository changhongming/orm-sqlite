# API說明
```
const Model = require('./sqlClass/model');

const member = new Model('member',
{
  id: {type: Model.INTERGER, pk:true, ai:true},
  name: {type: Model.TEXT, nn:true, defaultValue: 'default'},
  number: {type: Model.INTERGER, defaultValue: -1}
});
```
## 1. ```add( <addObj> )```
新增一筆資料到資料庫，```<addObj>```為要新增的物件。
```
member.add({number:22, name:'hello'})
.then(data => console.log(data))
.catch(err => console.log(err));
```


-----


## 2. ```delete( <deletWhere> )```
刪除資料庫內符合物件，```<deleteWhere>```為要刪除的物件位置。
```
member.delete({id:1})
.then(data => console.log(data))
.catch(err => console.log(err));
```


-----


## 3. ```update( <updateObj> , <updateWhere> )```
更新資料庫內符合的物件，```<updateObj>```為要更新的物件值；```<updateWhere>```為要更新的物件位置。
```
update({name: 'updateValue', number: 999}, {id: 1})
.then(data => console.log(data))
.catch(err => console.log(err));
```


-----


## 4. ```save()```
可以使用```save()```取代```add(<addObj>)```功能，只要依序在你的```model```內逐一定義數值即可。
```
member.name = 'Kevin';
member.errorCol = 'dsadas';
member.number = 33;
member.save()
.then(data => {console.log(data)})
.catch(err => console.log(err));
```
**注意**：使用此方法新增請避免使用```db```、```columns```、```tableName```名稱 


-----
## 5. ```findOne( <findWhere> )```
找尋第一筆符合的資料，```<findWhere>```為需要找尋的物件。
```
member.findOne({name: 'default', id:5})
.then(data => {console.log(data)})
.catch(err => console.log(err));
```

-----

## 6. ```findAll()```
回傳整個```model```的內容。
```
member.findAll()
.then(data => {console.log(data)})
.catch(err => console.log(err));
```
## 7. 型別說明
```
model.INTERGER = 'INTEGER';

model.TEXT = 'TEXT';

model.DATETIME = 'DATETIME';

model.BLOB = 'BLOB';

model.REAL = 'REAL';
```

# 同步流程控制
 - 使用async/await
 ```
 (async () => {
  try{
    await member.add({name:'hello'});
    await member.add({number:55});
    await hello.add({content:'ssss'});
    const data = await member.findAll()
    await member.update({name: 'updateValue', number: 999}, {id: 1})
    await member.delete({id:1})
    await member.findOne({name: 'default', id:5}).then(data => console.log(data));
    }
    catch (err) {
      console.log(err)
    }
})();
 ```
 -----

- 使用Promise
```
member.add({name:'newdata'})
.then(data => member.findAll())
.then(data => console.log(data))
.catch(err => console.log(err));
```
