import fs from 'fs';
import mongoose from 'mongoose';
import Operator from './models/operatorModel';
import dotenv from 'dotenv';
dotenv.config();
import { getStaticInformation } from './scraper/scraper';
import { load } from 'cheerio';
import fetch from 'node-fetch';

const BASE_URL = 'https://gamepress.gg/arknights/operator/';

mongoose.connect(process.env.MONGODB_URI!, (err: any)=> {
  if (err) throw err;
})

//requester();
scavenger();
weird();

async function scavenger() {
  console.log('Starting to scrape:');
  let operators = fs.readFileSync('operators.json','utf8')
  operators = JSON.parse(operators);
  for(let i = 0; i < operators.length; i++) {
    console.log(`Currently scraping information for ${operators[i]}. ${i+1}/${operators.length}`)
    const findOperator = await Operator.findOne({
      urlName: operators[i]
    });
    if (findOperator && findOperator.checkDate() === false) {
      console.log(`${operators[i]} already in database`)
    } else if (findOperator && findOperator.checkDate()){
      const findOperator = await Operator.findOne({
        urlName: operators[i]
      });
      if (findOperator && findOperator.checkDate()) {
        const updateInfo = await getStaticInformation(BASE_URL + operators[i]);
        const updateOperator = await Operator.replaceOne({
          name: updateInfo.name
        }, {
          "name": updateInfo.name,
          "urlName": updateInfo.urlName,
          "rarity": updateInfo.rarity,
          "alter": updateInfo.alter,
          "artist": updateInfo.artist,
          "va": updateInfo.va,
          "biography": updateInfo.biography,
          "description": updateInfo.description,
          "quote": updateInfo.quote,
          "voicelines": updateInfo.voicelines,
          "lore": updateInfo.lore,
          "affiliation": updateInfo.affiliation,
          "class": updateInfo.class,
          "tags": updateInfo.tags,
          "statistics": updateInfo.statistics,
          "trait": updateInfo.trait,
          "costs": updateInfo.costs,
          "potential": updateInfo.potential,
          "trust": updateInfo.trust,
          "talents": updateInfo.talents,
          "skills": updateInfo.skills,
          "module": updateInfo.module,
          "base": updateInfo.base,
          "headhunting": updateInfo.headhunting,
          "recruitable": updateInfo.recruitable,
          "art": updateInfo.art,
          "availability": updateInfo.availability,
          "url": updateInfo.url
        });
      }
    } else {
      const createdOperator = await getStaticInformation(BASE_URL + operators[i]);
      await Operator.create(createdOperator);
      console.log(`${operators[i]} recruited`)
    }
  }
}
async function weird() {
  const findOperator = await Operator.find({
    artist: 'Wé[email protected]'
  });
  for(let i = 0; i < findOperator.length; i++) {
    findOperator[i].artist = 'Wéi@W';
    await findOperator[i].save();
  }
}

async function requester() {
  const test = await fetch('https://gamepress.gg/arknights/tools/interactive-operator-list#tags=null##stats');
  const $ = load(await test.text());
  const data: string[] = [];
  $('.operator-title-actual').each(function(){
    let name = $(this).text().replaceAll('(', '');
    name = name.replaceAll(')', '');
    name = name.replaceAll('the', '');
    name = name.replaceAll('The', '');
    name = name.replaceAll("'", '');
    name = name.replaceAll('.', '');
    name = name.replaceAll(' ', '-');
    name = name.replaceAll('---', '-');
    name = name.replaceAll('--', '-');
    data.push(name);
  });
  const operatorJSON = JSON.stringify(data, null, '\t');
  fs.writeFile('./operators.json',  operatorJSON, err => {
    if (err) { console.log("Error writing to file.")}});
}