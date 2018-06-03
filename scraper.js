'use strict'

//require packages
const scrapeIt = require('scrape-it');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;

//create fields for list items
const fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
const json2csvParser = new Json2csvParser({ fields });
const listItems = [{}];

//Print Error Messages
const errorMessage = (error) => {
  console.error(`Error: ${error.message}`);
};

//check to see if a folder named 'data' exist
fs.stat('data', function (error, stats) {
  //if it does not create the data directory
  if (error) {
    fs.mkdir('data', function (error) {
      if (error) throw error;
      console.log('saved');
    });//end of fs.mkdir
  }//end of 'if'
});//end of fs.stat

//create array of shirt page links on website
let shirtID = [101, 102, 103, 104, 105, 106, 107, 108];

//vist the website http://shirts4mike.com/shirts.php and loop through each shirt page;
//use scraper to get field values
for (let i = 0; i < shirtID.length; i++) {
  //check for protocol error
  try {
    scrapeIt(`http://shirts4mike.com/shirt.php?id=${shirtID[i]}`, {

      Title: '.breadcrumb ',

      Price: '.price',
    })

  //create promise to get time and format the title; return the data
  .then(({ data })=> {
      data.URL = `http://shirts4mike.com`;
      data.ImageURL = `${data.URL}/shirt.php?id=${shirtID[i]}`;
      data.Time = new Date().toLocaleTimeString();
      data.Title = data.Title.slice(8);
      return data;
    })//end of then

  //create promise to push the response data to listItems
  .then((data) => {
      console.log(data);
      listItems.push(data);

      //pass lisitems to the json2csv parser and store in csv variable
      const csv = json2csvParser.parse(listItems);

      //create and format date variable for file name
      let date = new Date().toISOString().slice(0, 10);

      //write file to data folder using listitems as data
      fs.writeFile(`data/${date}.csv`, csv, function (error) {
      });//end of fs

    })//end of then

    .catch(function (error) {
      console.error(`There's been a 404 error. Cannot connect to '${error.message.slice(37, 51)}'. Please try 'http://shirts4mike.com'.`);
    });//end of catch

    //catch protocol error
  } catch (error) {
    errorMessage(error);
  }//end of catch
}//end of for loop
