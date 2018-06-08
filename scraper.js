'use strict'

//require packages
const scrapeIt = require('scrape-it');
const fs = require('fs');
const Json2csvParser = require('json2csv').Parser;

//make array for shirt url's
let shirtURLs = [];

//create fields for list items
const fields = ['Title', 'Price', 'ImageURL', 'URL', 'Time'];
const json2csvParser = new Json2csvParser({ fields });
const listItems = [{}];

//create error count variable
let errorCount = 0;

/*----------- FUNCTIONS ----------*/

//Print Error Messages function
const errorMessage = (error) => {
  let errorLog = [];
  let date = new Date();

  //push the error message and date to error log array;
  errorLog.push(`Error Date: [${date}] / Error Message: <${error.message}>`);

  // append error log to the error log file
  fs.appendFile('data/scraper-error.log', errorLog, function (error) {
    });//end of fs

  if (error.code === 'ERR_ASSERTION') {
    console.error(`Error:${error.message}`);
  }

  if (error.code === 'ENOTFOUND') {
    console.error(`There's been a 404 error. Cannot connect to 'shirts4mike.com'`);
  }
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

//vist the website http://shirts4mike.com/shirts.php as entry point;
//use scraper to get url links from list items
//check for protocol error
try {
  scrapeIt('http://shirts4mike.com/shirt.php', {
      // get list items
      shirts: {
          listItem: '.products li',

          //Get urls of list items
          data: {
              url: {
                selector: 'a',
                attr: 'href',
              },
            },
        },
    })//end of scrape

  //log sttus code
  .then(({ data, response })=> {
    console.log(`Status Code: ${response.statusCode}`);

    //push all shirt urls to shirtURL array
    for (let i = 0; i < data.shirts.length; i++) {
      shirtURLs.push(data.shirts[i].url);
    }
  }, (error, data) => {
        errorMessage(error);
      })//end of then

    //go to each shirt url and scrape required data
    .then((data) => {
      try {
        for (let i = 0; i < shirtURLs.length; i++) {
          scrapeIt(`http://shirts4mike.com/${shirtURLs[i]}`, {
            Title: '.breadcrumb ',
            Price: '.price',
            ImageURL: {
              selector: 'img',
              attr: 'src',
            },
            URL: {
              selector: '.breadcrumb a',
              attr: 'href',
            },

          })//end of scrape

        //format title and date
        .then(({ data }) => {
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

          //catch any errors
          .catch(function (error) {
              errorCount++;
              if (errorCount === 1) {
                errorMessage(error);
              }
            });//end of catch
        }//end of loop
      } catch (error) {
        errorMessage(error);
      };//end of catch
    });//end of then
} catch (error) {
  errorMessage(error);
};//end of catch
