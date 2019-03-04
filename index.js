const Model = require('./sqlClass/model');

const member = new Model('member',
{
  id: {type: 'INTEGER', pk:true, ai:true},
  name: {type:'TEXT', nn:true, defaultValue: 'default'},
  number: {type:'INTEGER', defaultValue: -1}
});

const hello = new Model('test2', {
  index: {type: 'INTEGER', pk:true, ai:true},
  content: {type: 'TEXT'}
});
member.add({name:'hello'});
member.add({number:55});
hello.add({content:'ssss'});
member.findAll().then(data => console.log(data))
member.update({name: 'updateValue', number: 999}, {id: 1})
member.delete({id:1})
member.findOne({name: 'default', id:5}).then(data => console.log(data));
