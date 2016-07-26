#!/usr/bin/env node
'use strict';

var Pokeio = require('pokemon-go-node-api');
var pokemons = require('pokemon-go-node-api/pokemons.json');
var exec = require('child_process').exec;

//Set environment variables or replace placeholder text
var location = {
    type: 'name',
    name: process.env.PGO_LOCATION || '37.776534, -122.417529'
};

var ignore = process.env.PGO_IGNORE || 'Charmander,Caterpie,Weedle,Kakuna,Pidgey,Pidgeotto,Pidgeot,Rattata,Raticate,Spearow,Fearow,Ekans,Arbok,Pikachu,Sandshrew,Nidoran ♀,Nidoran ♂,Jigglypuff,Zubat,Golbat,Paras,Parasect,Venonat,Diglett,Dugtrio,Meowth,Persian,Psyduck,Mankey,Growlithe,Abra,Machop,Bellsprout,Geodude,Exeggcute,Cubone,Rhyhorn,Eevee';
var username = process.env.PGO_USERNAME || 'USER';
var password = process.env.PGO_PASSWORD || 'PASSWORD';
var provider = process.env.PGO_PROVIDER || 'google';
var playSound = 'play whosthatpokemon.wav';

Pokeio.init(username, password, location, provider, function(err) {
    if (err) throw err;

    var toIgnore = ignore.split(',')
        .reduce(function (sum, elt) {
            sum[elt] = 1;
            return sum;
        }, {});

    console.log('[i] Current location: ' + Pokeio.playerInfo.locationName);
    console.log('[i] lat/long/alt: : ' + Pokeio.playerInfo.latitude + ' ' + Pokeio.playerInfo.longitude + ' ' + Pokeio.playerInfo.altitude);

    Pokeio.GetProfile(function(err, profile) {
        if (err) throw err;

        console.log('[i] Username: ' + profile.username);
        console.log('[i] Poke Storage: ' + profile.poke_storage);
        console.log('[i] Item Storage: ' + profile.item_storage);

        var poke = 0;
        if (profile.currency[0].amount) {
            poke = profile.currency[0].amount;
        }

        console.log('[i] Pokecoin: ' + poke);
        console.log('[i] Stardust: ' + profile.currency[1].amount);

        setInterval(function () {
            Pokeio.Heartbeat(function(err,hb) {
                if(err) {
                    console.log(err);
                }
                if (hb) {
                    hb.cells.forEach(function (cell) {
                        cell.NearbyPokemon.forEach(function (pokemon) {
                            pokemons.pokemon.forEach(function (pok) {
                                if (pokemon.PokedexNumber == pok.id) {
                                    if (toIgnore[pok.name] == undefined) {
                                        // console.log(JSON.stringify(hb, null, 4));
                                        console.log(pok.name);
                                        cell.DecimatedSpawnPoint.forEach(function (loc) {
                                            console.log('https://www.google.com/maps/@' + loc.Latitude + ',' + loc.Longitude);
                                        });
                                        cell.DecimatedSpawnPoint.forEach(function (loc) {
                                            console.log(loc.Latitude + ',' + loc.Longitude);
                                        });
                                        exec(
                                            playSound,
                                            function (err, stdout, stderr) {
                                                if (err) { console.error(err); return; }
                                                console.log(stdout);
                                            }
                                        );
                                    }
                                }
                            });
                        });
                    });
                    console.log('---');
                } else {
                    console.log('-');
                }
            });
        }, 30000);
    });
});
