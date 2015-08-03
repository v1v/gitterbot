"use strict";

var yaml = require('js-yaml');
var fs = require('fs');

var Utils = require('../../lib/utils/Utils'),
    InputWrap = require('../../lib/bot/InputWrap'),
    KBase = require('../../lib/bot/KBase'),
    TextLib = require('../../lib/utils/TextLib');


var newline = '\n';

// https://raw.githubusercontent.com/FreeCodeCamp/freecodecamp/staging/seed/challenges/basic-bonfires.json
// https://github.com/FreeCodeCamp/freecodecamp/blob/staging/seed/challenges/basic-bonfires.json

// based on original json format from FCC
/*
    "id": "bd7139d8c441eddfaeb5bdef",
    "name": "Waypoint: Pair Program on Bonfires",
    "dashedName": "waypoint-pair-program-on-bonfires",
    "difficulty": 0.44,
    "challengeSeed": ["119657641"],
    "description": [],
    "challengeType": 2,
    "tests": [],
    "nameCn": "",
    "descriptionCn": [],
    "nameFr": "",
    "descriptionFr": [],
    "nameRu": "",
    "descriptionRu": [],
    "nameEs": "",
    "descriptionEs": [],
    "namePt": "",
    "descriptionPt": []
*/


var Bonfires;

Bonfires = {
    data: null,

    load: function () {
        if (this.data) {
            return this.data;
        }
        // Get document, or throw exception on error
        try {
            // this.data = yaml.safeLoad(fs.readFileSync('./data/bonfires/basic-bonfires.yml', 'utf8'));
            this.raw = fs.readFileSync('./data/seed/challenges/basic-bonfires.json', 'utf8');
            this.data = JSON.parse(this.raw);
            // this.data = Utils.toMarkdown(this.data);
            // Utils.log("bonfires", this.data);
        } catch (e) {
            Utils.error("can't load bonfire data", e);
        }
        return this;  // chainable
    },

    loadWikiHints: function () {
        var testBf = this.findBonfire('Bonfire Factorialize a Number');
        //Utils.tlog("-- Bonfires.loadWikiHints start / WikiHints >", testBf.wikiHints);
        this.data.challenges = this.data.challenges.map(function (bf) {
            var wikiHints = KBase.getWikiHints(bf.dashedName);
            if (wikiHints) {
                bf.wikiHints = wikiHints;
                //Utils.tlog('bf.wikihints found', bf);
            } else {
                //Utils.tlog("bf.wikiHints not found", bf.dashedName);
            }
            return bf;
        });
        //Utils.tlog("Bonfires.loadWikiHints end / WikiHints >", testBf.wikiHints);
    },

    toMarkdown: function (data) {
        this.data.challenges = this.data.challenges.map(function (item) {
            item.description = item.description.map(function (desc) {
                return Utils.toMarkdown(desc);
            });
        });
    },

    allDashedNames: function () {
        return this.fieldList('dashedName');
    },

    allNames: function () {
        return this.fieldList('name');
    },

    fieldList: function (field) {
        var list = this.data.challenges.map(function (item) {
            // console.log(item);
            // console.log('-----------');
            return item[field];
        });
        return list;
    },

    findBonfire: function (bfName) {
        var lcName, flag;
        bfName = TextLib.dashedName(bfName);
        var bfs = this.data.challenges.filter(function (item) {
            flag = (item.dashedName.includes(bfName));
            //Utils.tlog(item.dashedName, bfName);
            return flag;
        });
        var bf = bfs[0];
        if (!bf) {
            Utils.warn("cant find bonfire for " + bfName);
            return null;
        } else {
            return bf;
        }
    },

    getDescription: function (bonfire) {
        var desc = bonfire.description.join('\n');
        return desc;
    },

    fromInput: function (input) {
        var roomName, bf;
        roomName = InputWrap.roomShortName(input);
        bf = this.findBonfire(roomName);
        Utils.checkNotNull(bf, 'cant find bonfire for ' + roomName );
        return (bf);
    },

    getNextHint: function (bonfire) {
        var hint, hintNum;
        hintNum = bonfire.currentHint || 0;
        hint = bonfire.description[hintNum];

        bonfire.prepare();

        if (hint) {
            hint = "`[" + hintNum + "]` " + hint;
            bonfire.currentHint = hintNum + 1;
            return hint;
        } else {
            bonfire.currentHint = 0;
            return "no more hints! Let's start again.";
        }
    },

    // from input
    getHint: function (input, num) {
        num = num || 0;
        var output, bf, roomName;
        roomName = InputWrap.roomShortName(input);
        bf = this.findBonfire(roomName);

        if (!bf || !bf.description) {
            var msg = ("no outputs found for: " + roomName);
            Utils.error("Bonfires>", msg, bf);
            return msg;
        }

        output = "hint for " + roomName + newline;
        output += (bf.description[0]);
        return output;
    },

    getLinks: function (bonfire) {
        // FIXME - change to actual links see
        // https://github.com/dcsan/gitterbot/issues/45
        var output = "links: \n";
        output += Utils.makeUrlList(bonfire.MDNlinks, 'mdn');
        return output;
    },

    getLinksFromInput: function (input) {
        var bf;
        bf = Bonfires.fromInput(input);

        if (!bf || !bf.MDNlinks) {
            var msg = ("no links found for: " + input.params);
            Utils.error("Bonfires>", msg, bf);
            return msg;
        }
        return this.getLinks(bf);
    },

    getSeed: function (bonfire) {
        var output, seed;
        seed = bonfire.challengeSeed.join("\n");
        output = "```js " + newline;
        output += seed;
        output += "```";
        return output;
    },

    getChallengeSeedFromInput: function (input) {
        var output, bf, roomName, seed;
        roomName = InputWrap.roomShortName(input);
        bf = Bonfires.fromInput(input);

        if (!bf || !bf.challengeSeed) {
            var msg = ("no challengeSeed found for: " + input.params);
            Utils.error("Bonfires>", msg, bf);
            return msg;
        }

        seed = bf.challengeSeed.join("\n");

        output = "```js " + newline;
        output += seed;
        output += "```";
        return output;
    },


};

// ideally KBase should be loaded first,
// though in theory it will load itself before data is needed ...?

Bonfires.load();
Bonfires.loadWikiHints();

module.exports = Bonfires;

