'use strict'

const scrapeIt = require('scrape-it');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;
const times = new Date();
const fields = ['title', 'price', 'imageURL', 'url', 'time']
const json2csvParser = new Json2csvParser({fields})
const listItems = [{}];
//const options = {}
//check to see if a folder named 'data' exist
fs.stat('data', function (error, stats) {
  //if it does not create the data directory
  if (error) {
    fs.mkdir('data', function (error) {
      if (error) throw error;
      console.log('saved');

    });
  }
});
let shirtID = [101,102,103,104,105,106,107,108]
//vist the website http://shirts4mike.com/shirts.php
// Promise interface
for (let i = 0; i < shirtID.length; i++){
scrapeIt(`http://shirts4mike.com/shirt.php?id=${shirtID[i]}`, {
  title:'.breadcrumb ',

  price: '.price',

  imageURL: {
    selector: 'img ',
    attr: 'src'
  },

  url: {
    selector: '.breadcrumb a',
    attr: 'href'
  },
})
.then(({ data, response })=> {
  data.title = data.title.slice(8);
  return data;
})
.then((response) => {
  console.log(response)
listItems.push(response);
listItems.push(times)
const csv = json2csvParser.parse(listItems);
let date = new Date().toISOString().slice(0,10);
    fs.writeFile(date + ".csv", csv, function(error){
      // console.log(csv);

    }
    );//end of fs
}).catch(function(error) {
  console.log(error)
})//end of catch
}//end of for loop
