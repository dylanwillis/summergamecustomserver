var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fileSystem = require('fs');
var path = require('path');
var http = require('http');
var sqlite3 = require('sqlite3').verbose();
var file = "msgcs.sqlite3";
var exists = fileSystem.existsSync(file);

var ProtoBuf = require("protobufjs");
var ByteBuffer = ProtoBuf.ByteBuffer;   // ByteBuffer include for ProtoBuf
var Long = ProtoBuf.Long;               // Long for ProtoBuf with 64bit Int support for Steam

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

var db = new sqlite3.Database(file);

var builder = ProtoBuf.loadProtoFile("messages.proto");
    var m_protobuf_GetGameDataResponse = builder.build( "CTowerAttack_GetGameData_Response" );
    var m_protobuf_GetPlayerNamesResponse = builder.build( "CTowerAttack_GetPlayerNames_Response" );
    var m_protobuf_GetPlayerDataResponse = builder.build( "CTowerAttack_GetPlayerData_Response" );
    var m_protobuf_UseAbilitiesResponse = builder.build( "CTowerAttack_UseAbilities_Response" );
    var m_protobuf_ChooseUpgradeResponse = builder.build( "CTowerAttack_ChooseUpgrade_Response" );
    var m_protobuf_UseBadgePointsResponse = builder.build( "CTowerAttack_UseBadgePoints_Response" );

function updatePlayerTechTree(player_id, tech_tree, callback) {
        db.each("SELECT * FROM tech WHERE player_id = "+player_id, function(err, row){
        tech_tree.tech_tree.upgrades[row.tech_id].level = row.level;
        tech_tree.tech_tree.upgrades[row.tech_id].cost_for_next_level = row.cost_for_next_level;

    }, function(err, rows){
        callback(tech_tree);
    });
}

function updatePlayerData(player_id, callback) {
    var player_data = {'player_data': {hp: 1000, current_lane: 1, target: 0, time_died: null, gold: 0, active_abilities_bitfield: {low: 0, high: 0, unsigned: true }, active_abilities: [], crit_damage: 0, loot: [] }, tech_tree: {upgrades: [{upgrade: 0,level: 11,cost_for_next_level: 2384180},{upgrade: 1,level: 0,cost_for_next_level: 150},{upgrade: 2,level: 0,cost_for_next_level: 200},{upgrade: 3,level: 0,cost_for_next_level: 50},{upgrade: 4,level: 0,cost_for_next_level: 50},{upgrade: 5,level: 0,cost_for_next_level: 50},{upgrade: 6,level: 0,cost_for_next_level: 50},{upgrade: 7,level: 0,cost_for_next_level: 50},{upgrade: 8,level: 12,cost_for_next_level: 128550050},{upgrade: 9,level: 0,cost_for_next_level: 10000},{upgrade: 10,level: 0,cost_for_next_level: 10000},{upgrade: 11,level: 0,cost_for_next_level: 5000},{upgrade: 12,level: 0,cost_for_next_level: 10000000},{upgrade: 13,level: 0,cost_for_next_level: 1000000},{upgrade: 14,level: 0,cost_for_next_level: 10000000},{upgrade: 15,level: 0,cost_for_next_level: 10000000},{upgrade: 16,level: 0,cost_for_next_level: 100000},{upgrade: 17,level: 0,cost_for_next_level: 1000000},{upgrade: 18,level: 0,cost_for_next_level: 2000000},{upgrade: 19,level: 0,cost_for_next_level: 100000},{upgrade: 20,level: 8,cost_for_next_level: 54875880},{upgrade: 21,level: 0,cost_for_next_level: 100000},{upgrade: 22,level: 0,cost_for_next_level: 100000},{upgrade: 23,level: 0,cost_for_next_level: 1000000},{upgrade: 24,level: 0,cost_for_next_level: 1000000},{upgrade: 25,level: 0,cost_for_next_level: 1000000},{upgrade: 26,level: 0,cost_for_next_level: 10000000},{upgrade: 27,level: 0,cost_for_next_level: 10000000},{upgrade: 28,level: 0,cost_for_next_level: 10000000},{upgrade: 29,level: 0,cost_for_next_level: 100000000},{upgrade: 30,level: 0,cost_for_next_level: 100000000},{upgrade: 31,level: 0,cost_for_next_level: 100000000},{upgrade: 32,level: 0,cost_for_next_level: 1000000000},{upgrade: 33,level: 0,cost_for_next_level: 1000000000},{upgrade: 34,level: 0,cost_for_next_level: 1000000000},{upgrade: 35,level: 0,cost_for_next_level: 10000000000},{upgrade: 36,level: 0,cost_for_next_level: 10000000000},{upgrade: 37,level: 0,cost_for_next_level: 10000000000},{upgrade: 38,level: 0,cost_for_next_level: 99999997952},{upgrade: 39,level: 0,cost_for_next_level: 99999997952},{upgrade: 40,level: 0,cost_for_next_level: 99999997952},{upgrade: 41,level: 0,cost_for_next_level: 999999995904},{upgrade: 42,level: 0,cost_for_next_level: 999999995904},{upgrade: 43,level: 0,cost_for_next_level: 999999995904}],damage_per_click: 10,damage_multiplier_fire: 1,damage_multiplier_water: 1,damage_multiplier_air: 1,damage_multiplier_earth: 1,damage_multiplier_crit: 2,unlocked_abilities_bitfield: 0,hp_multiplier: 935.29999947547913,crit_percentage: 0.10000000149011612,badge_points: 0,ability_items: [{ability: 27,quantity: 42580},{ability: 20,quantity: 2},{ability: 13,quantity: 1},{ability: 14,quantity: 4},{ability: 18,quantity: 4},{ability: 17,quantity: 3},{ability: 19,quantity: 5},{ability: 16,quantity: 1},{ability: 21,quantity: 2},{ability: 24,quantity: 4},{ability: 26,quantity: 57038},{ability: 15,quantity: 2},{ability: 23,quantity: 1}],boss_loot_drop_percentage: 0.25,damage_multiplier_dps: 1,damage_per_click_multiplier: 1,max_hp: 935299.99947547913,dps: 0}};

    db.each("SELECT * FROM player WHERE player_id = "+player_id, function(err, row) {
        player_data.player_data.hp = row.hp;
        player_data.player_data.current_lane = row.current_lane;
        player_data.player_data.target = row.target;
        player_data.player_data.gold = row.gold;
        player_data.player_data.time_died = row.time_died;
        player_data.player_data.crit_damage = row.crit_damage;
        player_data.tech_tree.damage_per_click = row.damage_per_click;
        player_data.tech_tree.damage_multiplier_dps = row.damage_multiplier_dps;
        player_data.tech_tree.damage_multiplier_fire = row.damage_multiplier_fire;
        player_data.tech_tree.damage_multiplier_water = row.damage_multiplier_water;
        player_data.tech_tree.damage_multiplier_air = row.damage_multiplier_air;
        player_data.tech_tree.damage_multiplier_earth = row.damage_multiplier_earth;
        player_data.tech_tree.hp_multiplier = row.hp_multiplier;
        player_data.tech_tree.crit_percentage = row.crit_percentage;
        player_data.tech_tree.badge_points = row.badge_points;
        player_data.tech_tree.boss_loot_drop_percentage = row.boss_loot_drop_percentage;
        player_data.tech_tree.damage_per_click_multiplier = row.damage_per_click_multiplier;
        player_data.tech_tree.max_hp = row.max_hp;
        player_data.tech_tree.dps = row.dps;
        player_data.tech_tree.damage_multiplier_crit = row.damage_multiplier_crit;
        updatePlayerTechTree(row.id, player_data, function(player_data){
            callback(player_data);
        });
    });
}

function getPlayerLaneAndClickDamage(player_id, callback){
    db.get("SELECT current_lane, damage_per_click, damage_per_click_multiplier FROM player WHERE player_id = "+player_id, function(err, row){
        callback(row['current_lane'], [row['damage_per_click']*row['damage_per_click_multiplier']]);
    });
}

function takeFromMonsterHP(number_clicks, player_id)
{
        var num_clicks = 0;
        if(number_clicks >= 20) {
            num_clicks = 20;
        } else {
            num_clicks = number_clicks;
        }
        db.get("SELECT target, current_lane, damage_per_click FROM player WHERE player_id = "+player_id, function(err, row){
                db.each("SELECT hp, id FROM monsters WHERE lane = "+row.current_lane+" AND target = "+row.target, function(err, rows){
                    console.log(err);
                    if(rows.hp>0){
                        var new_hp = rows.hp - (num_clicks*row.damage_per_click);
                        db.run("UPDATE monsters SET hp = "+new_hp+" WHERE id = "+rows.id)
                    }
                });
        });
}

function purchaseUpgradePlayer(upgrade_arr, player_id, callback){
    db.get("SELECT * FROM tech WHERE player_id = "+player_id+" AND tech_id = "+upgrade_arr, function(err, row){
        getPlayerGold(player_id, function(gold_amount){
            if(gold_amount >= row.cost_for_next_level)
            {
                grantPlayerUpgrade(row.id, row.level+1, row.cost_for_next_level, gold_amount, player_id, function(){
                    callback();
                })
            }
        });
    });
};

function updatePlayerUpgradesToStats(player_id, callback){
    var hp = 1000;
    var dps = 0;
    var click_damage = 10;
    db.each("SELECT * FROM tech WHERE player_id="+player_id, function(err, row){
        switch(row.tech_id){
            case 0:
                hp=hp+(1300*row.level);
                break;
            case 1:
                dps=dps+10*row.level;
                break;
            case 2:
                click_damage=10+(10*row.level);
                break;
            case 3:
                //fire
                break;
            case 4:
                //water
                break;
            case 5:
                //air
                break;
            case 6:
                //earth
                break;
            case 7:
                //crits
                break;
            case 8:
                hp=hp+(10000*row.level);
                break;
            case 9:
                dps=dps+100*row.level;
                break;
            case 10:
                click_damage=click_damage+100*row.level;
                break;
            case 11:
                //unlock medics
                break;
            case 12:
                //unlock morale booster
                break;
            case 13:
                //unlock goodluck charms
                break;
            case 14:
                //unlock metal detector
                break;
            case 15:
                //decrease cooldowns
                break;
            case 16:
                //tactical nuke
                break;
            case 17:
                //cluster bomb
                break;
            case 18:
                //napalm
                break;
            case 19:
                //boss loot
                break;
            case 20:
                hp=hp+(10000*row.level);
                break;
            case 21:
                dps=dps+((100*10)*row.level);
                break;
            case 22:
                click_damage=click_damage+((100*10)*row.level);
                break;
            case 23:
                hp=hp+((1000*1000)*row.level);
                break;
            case 24:
                dps=dps+((1000*10)*row.level);
                break;
            case 25:
                click_damage=click_damage+((1000*10)*row.level);
                break;
            case 26:
                hp=hp+((10000*1000)*row.level);
                break;
            case 27:
                dps=dps+((10000*10)*row.level);
                break;
            case 28:
                click_damage=click_damage+((10000*10)*row.level);
                break;
            case 29:
                hp=hp+((100000*1000)*row.level);
                break;
            case 30:
                dps=dps+((100000*10)*row.level);
                break;
            case 31:
                click_damage=click_damage+((100000*10)*row.level);
                break;
            case 32:
                hp=hp+((1000000*1000)*row.level);
                break;
            case 33:
                dps=dps+((1000000*10)*row.level);
                break;
            case 34:
                click_damage=click_damage+((1000000*10)*row.level);
                break;
            case 35:
                hp=hp+((10000000*1000)*row.level);
                break;
            case 36:
                dps=dps+((10000000*10)*row.level);
                break;
            case 37:
                click_damage=click_damage+((10000000*10)*row.level);
                break;
            case 38:
                hp=hp+((100000000*1000)*row.level);
                break;
            case 39:
                dps=dps+((100000000*10)*row.level);
                break;
            case 40:
                click_damage=click_damage+((100000000*10)*row.level);
                break;
            case 41:
                hp=hp+((1000000000*1000)*row.level);
                break;
            case 42:
                dps=dps+((1000000000*10)*row.level);
                break;
            case 43:
                click_damage=click_damage+((1000000000*10)*row.level);
            default:
                break;
        }


        db.run('UPDATE player SET hp = '+hp+' WHERE id = '+player_id,function(err){
            db.run('UPDATE player SET max_hp = '+hp+' WHERE id = '+player_id,function(err){
                db.run('UPDATE player SET damage_per_click = '+click_damage+' WHERE id = '+player_id, function(err){
                    db.run('UPDATE player SET dps = '+dps+' WHERE id = '+player_id, function(err){
                    });
                });
            });
        });
    }, function() {
        callback();
    });
}

function grantPlayerUpgrade(row_id, level, cost, gold, player_id, callback){
    cost = cost*2;
    console.log("cost: " + cost + " level: " + level);
    var query = "UPDATE tech SET cost_for_next_level = "+cost+" WHERE id ="+row_id;
    db.run(query, function(err){
        query = "UPDATE tech SET level = "+level+" WHERE id="+row_id;
        db.run(query, function(err){
        db.run("UPDATE player SET gold="+(gold-cost)+" WHERE id = "+player_id, function(err){}, function(err){
            updatePlayerUpgradesToStats(player_id, function(){
                callback();
            });
        });
        });
        console.log(err);
    });
}

function getPlayerGold(player_id, callback){
    db.each("SELECT gold FROM player WHERE id = "+player_id, function(err, row){
        callback(row['gold']);
    });
}

function increasePlayerGold(amount, player_id){
    db.each("SELECT gold FROM player WHERE player_id = " + player_id, function(err, row){
        db.run('UPDATE player SET gold = '+(row.gold+amount)+' WHERE player_id = '+player_id, function(err){
        });
    });
}

function changePlayerLane(lane, player_id){
    var lane_new = lane;
    db.run('UPDATE player SET current_lane = '+lane_new+' WHERE player_id = '+player_id);
}

function updatePlayerTarget(target, player_id){
    db.run('UPDATE player SET target = '+target+' WHERE player_id = '+player_id);
}

function updatePlayerStat(stat, value, player_id){
    db.run('UPDATE player SET '+stat+' = '+value+' WHERE player_id = '+player_id);
}

function createPlayerData (callback) {
    updatePlayerData(12345678, function(player_data){
        var encmsg = m_protobuf_GetPlayerDataResponse.encode(player_data);
        callback(encmsg);
    });
}

function createGetPlayerNames(callback) {
    var playname = {'names': [{accountid: 12345678, name: "geckoslayer"}]};
    var encmsg = m_protobuf_GetPlayerNamesResponse.encode(playname);
    callback(encmsg);
}

function generateMonstersRound(level, callback) {
    // is level a multiple of 10 - if so it's a boss round
    if(((level+1)%10)==0){
        // Boss round!!!  Hope it's a multiple of 100, GOLD HEEEELM!  HONK!
        // Boss round we spawn 1 boss in a room at random and then the other 2 rooms
        //  each get 3 minibosses.  The client chooses what boss is shown so we can't
        //  give them goldhelm every round :[
        // We'll get the bosses lane by using Math.random():
        var boss_lane = Math.round(Math.random()*2);
        db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*10000)+","+(level*10000)+","+(level*25)+","+(level*500)+","+boss_lane+",2,0);", function(err){
            if(err){
                console.log(err);
            }
            // Fancy maths tricks to get the other two lanes..
            // Math.sqrt((boss_lane-2)*(boss_lane-2)) - gives us the first non-boss lane
            // Math.sqrt((boss_lane-1)*(boss_lane-1)) - gies us the second non-boss lane
            db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*100)+","+Math.sqrt((boss_lane-2)*(boss_lane-2))+",3,0);", function(err){
                db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*100)+","+Math.sqrt((boss_lane-2)*(boss_lane-2))+",3,1);", function(err){
                    db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*100)+","+Math.sqrt((boss_lane-2)*(boss_lane-2))+",3,2);", function(err){
                        db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*100)+","+Math.sqrt((boss_lane-1)*(boss_lane-1))+",3,0);", function(err){
                            db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*100)+","+Math.sqrt((boss_lane-1)*(boss_lane-1))+",3,1);", function(err){
                                db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*100)+","+Math.sqrt((boss_lane-1)*(boss_lane-1))+",3,2);", function(err){
                                    callback();
                                });
                            });
                        });
                    });
                });
            });
        })
    } else {
        // Random chance it's a treasure round, I'll say... 3% chance...
        var ran_chance = Math.round(Math.random()*100);
        if(ran_chance == 1 || ran_chance == 10 || ran_chance == 30) {
            // Treasure Round!!!! 3*Type 4 monsters in every lane!  Make them drop a ton of gold!
            db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*500)+",1,4,0);", function(err){
                db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*500)+",1,4,1);", function(err){
                    db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*500)+",1,4,2);", function(err){
                        db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*500)+",2,4,0);", function(err){
                            db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*500)+",2,4,1);", function(err){
                                db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*500)+",2,4,2);", function(err){
                                    db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*500)+",1,4,0);", function(err){
                                        db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*500)+",1,4,1);", function(err){
                                             db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+(level*100)+","+(level*100)+","+(level*10)+","+(level*500)+",1,4,2);", function(err){
                                                callback();
                                            });
                                        });
                                    }); 
                                });
                            });
                        });
                    });
                });
            });
        } else {
            // Normal round with spawners and mobs..
            var spawner_hp  = level*100;
            var mob_hp      = level*50;
            var spawner_dps = level*15;
            var mob_dps     = level*5;
            var spawner_gold= level*100;
            var mob_gold    = level*25;
            db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+spawner_hp+","+spawner_hp+","+spawner_dps+","+spawner_gold+",0,0,0);", function(err){
                db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+mob_hp+","+mob_hp+","+mob_dps+","+mob_gold+",0,1,1);", function(err){
                    db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+mob_hp+","+mob_hp+","+mob_dps+","+mob_gold+",0,1,2);", function(err){
                        db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+mob_hp+","+mob_hp+","+mob_dps+","+mob_gold+",0,1,3);", function(err){
                            db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+spawner_hp+","+spawner_hp+","+spawner_dps+","+spawner_gold+",1,0,0);", function(err){
                                db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+mob_hp+","+mob_hp+","+mob_dps+","+mob_gold+",1,1,1);", function(err){
                                    db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+mob_hp+","+mob_hp+","+mob_dps+","+mob_gold+",1,1,2);", function(err){
                                        db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+mob_hp+","+mob_hp+","+mob_dps+","+mob_gold+",1,1,3);", function(err){
                                            db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+spawner_hp+","+spawner_hp+","+spawner_dps+","+spawner_gold+",2,0,0);", function(err){
                                                db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+mob_hp+","+mob_hp+","+mob_dps+","+mob_gold+",2,1,1);", function(err){
                                                     db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+mob_hp+","+mob_hp+","+mob_dps+","+mob_gold+",2,1,2);", function(err){
                                                         db.run("INSERT INTO monsters (level, hp, max_hp, dps, gold, lane, type, target) VALUES ("+level+", "+mob_hp+","+mob_hp+","+mob_dps+","+mob_gold+",2,1,3);", function(err){
                                                            callback();
                                                        });
                                                    });
                                                });
                                            }); 
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
    }
}

function createGameData (callback) {
    MonsterTick(function(){ // THIS NEEDS TO GET OUF OF THIS FUNCITON LATER, LOLHAX - I NEED TO MAKE A SEPERATE FILE THAT DOES ALL THE BACKGROUND PROCESSING LATER BU FOR NOW THIS IS GOING IN HERE PLEASE REMOVE ME LATER DEAR LORD
        MonsterDeathTick(function(){
            LaneTick(function(){
            db.get("SELECT * FROM game WHERE id = 1", function(err, game_row){
                db.get("SELECT * FROM level WHERE game_id = 1 AND level = "+game_row.level, function(err, level_row){
                    var game_data = {'game_data': {level: 3, lanes: {}, timestamp: 0, status: 2, events: [], timestamp_game_start: 0, timestamp_level_start: 0, universe_state: null}};
                    game_data.game_data.level = game_row.level;
                    game_data.game_data['status'] = game_row.status;
                    game_data.game_data.timestamp_game_start = game_row.timestamp;
                    game_data.game_data.timestamp_level_start = level_row.timestamp;
                    var lanes = [];
                    lanes[0] = {enemies: [], dps: 0, gold_dropped: null, active_player_abilities: [], player_hp_buckets: [0,0,0,0,0,0,0,0,0,1], element: 4, active_player_ability_decrease_cooldowns: 0, active_player_ability_gold_per_click: 0};
                    lanes[1] = {enemies: [], dps: 0, gold_dropped: null, active_player_abilities: [], player_hp_buckets: [0,0,0,0,0,0,0,0,0,1], element: 4, active_player_ability_decrease_cooldowns: 0, active_player_ability_gold_per_click: 0};
                    lanes[2] = {enemies: [], dps: 0, gold_dropped: null, active_player_abilities: [], player_hp_buckets: [0,0,0,0,0,0,0,0,0,1], element: 4, active_player_ability_decrease_cooldowns: 0, active_player_ability_gold_per_click: 0};
                    var j = 0;
                    db.each("SELECT * FROM monsters", function(err, row){
                        lanes[row.lane].enemies.push({id:0,type:0,hp:0,max_hp:0,dps:0,gold:0});
                        lanes[row.lane].enemies[lanes[row.lane].enemies.length-1]['id'] = row.id;
                        lanes[row.lane].enemies[lanes[row.lane].enemies.length-1].hp = row.hp;
                        lanes[row.lane].enemies[lanes[row.lane].enemies.length-1].max_hp = row.max_hp;
                        lanes[row.lane].enemies[lanes[row.lane].enemies.length-1].dps = row.dps;
                        lanes[row.lane].enemies[lanes[row.lane].enemies.length-1].gold = row.gold;
                        lanes[row.lane].enemies[lanes[row.lane].enemies.length-1]['type'] = row['type'];
                        j=j+1;
                    }, function(err){
                                game_data.game_data.lanes = lanes;
                                game_data.game_data.timestamp = Math.round(+new Date()/1000);
                                game_data.stats = null;
                                var encmsg = m_protobuf_GetGameDataResponse.encode(game_data);
                                callback(encmsg);
                    });
                });
            });
        });
    });
});
}

function LaneTick(callback){
        db.all("SELECT * FROM monsters", function(errs, rows){
        if(rows.length == 0)
        {
            // all monsters are dead
            db.get("SELECT * FROM game WHERE id = 1", function(err, row){
                db.run("UPDATE level SET complete = 1 WHERE level = "+row.level,function(err){
                    db.run("UPDATE game SET level="+(row.level+1)+" WHERE id=1", function(err){
                        db.run("INSERT INTO level (game_id, timestamp, level, complete) VALUES ("+row.id+", "+Math.round(+new Date()/1000)+", "+(row.level+1)+", 0);", function(err){
                            generateMonstersRound(row.level+1, function(){
                                callback();
                            });
                        });
                    });
                });
            });
        } else {
            callback();
        }
    });
}
function MonsterDeathTick(callback) {
    db.each("SELECT * FROM monsters", function(err, row){
        if(row.hp <= 0){
            // Monster is dead
            // Remove monster from db and gift all players in lane that gold..
            db.each("SELECT gold, id FROM player WHERE current_lane = "+row.lane, function(err_player, row_player){
                // Check in here whether all monsters from all lanes are dead...
                db.run("UPDATE player SET gold = "+(row_player.gold+row.gold)+" WHERE id="+row_player.id, function(err){});
            }, function(err){
                // end of loop
                // delete monster from list now..
                db.run("DELETE FROM monsters WHERE id = "+row.id, function(err){
                });
            });
        }
    }, function(err){
        callback();
    });
}
function MonsterTick(callback) {
    // This function should do the secondly tick on monster HP.
    // Should remove DPS of all players in lane off monster

    // Dirty hack approaching:
    //  I currently have this being run by the GameData request from the client which comes every 7 seconds.
    //  When we have more than 1 player, this needs to become a separate running js thread, and probably run every 1 second.
    db.each("SELECT * FROM monsters", function(err, row){
        // Get all player DPS in lane that have their target set as this monster..
        var dps = 0;
        db.each("SELECT dps, target FROM player WHERE current_lane = "+row.lane+" AND target = "+row.target, function(monster_err, monster_row){
            dps=dps+monster_row.dps;
            if(dps>0){
                // this dps*7 needs to updated to just dps without the 7 multiplier when we put this function as a separate instance
                db.run("UPDATE monsters SET hp = "+(row.hp-(dps*7))+" WHERE id="+row.id,function(err){

                });
            }
        });
    }, function(err){
        callback();
    });
}

//For all your static (js/css/images/etc.) set the directory name (relative path).
app.use(express.static(__dirname + '/public'));

//A sample GET request    
app.get("/ITowerAttackMiniGameService/GetPlayerData/v0001/", function(req, res) {
	console.log("Player Data");

    createPlayerData( function(cb) {
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream'
        });
        res.end(cb.toBuffer(), 'binary');
    });
});

app.get("/ITowerAttackMiniGameService/GetGameData/v0001/", function(req, res) {
	console.log("Game Data");
    createGameData( function(cb) {
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream'
        });
        res.end(cb.toBuffer(), 'binary');
    });
});

app.get("/ITowerAttackMiniGameService/GetPlayerNames/v0001/", function(req, res) {
    console.log("Player Names Data");
    createGetPlayerNames( function(cb) {
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream'
        });
        res.end(cb.toBuffer(), 'binary');
    });
});

app.post("/ITowerAttackMiniGameService/ChooseUpgrade/v0001/", function(req, res) {
    upgrade_arr = JSON.parse(req.body.input_json).upgrades;
    for(var i = 0; i < upgrade_arr.length; i++)
    {
        purchaseUpgradePlayer(upgrade_arr[i], 1, function(){
            if(i==upgrade_arr.length-1){
                createPlayerData( function(cb){
                    res.writeHead(200, {
                        'Content-Type': 'application/octet-stream'
                    });
                    res.end(cb.toBuffer(), 'binary');
                })
            }
        });
    }
});

app.post("/ITowerAttackMiniGameService/UseAbilities/v0001/", function(req, res) {
    //console.log(req.body);
    ability_arr = JSON.parse(req.body.input_json).requested_abilities;
    ability_arr_len = ability_arr.length;
    for (var i = 0; i < ability_arr_len; i++) {
        switch(ability_arr[i].ability) {
            case 2:
                // Switch Lanes, anyone can do it
                changePlayerLane(ability_arr[i].new_lane, 12345678);
                break
            case 4:
                // Switch Targets, todo: need to figure out whether target exists... so far we just trust them
                updatePlayerTarget(ability_arr[i].new_target, 12345678);
                break
            case 1:
                // click attack, todo: calculate using player skills how much click damage this does..
                takeFromMonsterHP(ability_arr[i].num_clicks, 12345678);
                break;
            case 15:
                // cripple monster
                break;
            case 13:
                // resurection
                break;
            case 14:
                // criple spawner
                break;
            case 16:
                // max elemental damage
                break;
            case 17:
                // raining gold
                break;
            case 18:
                // crit
                break;
            case 19:
                // pumped up
                break;
            case 20:
                // throw money at target
                break;
            case 21:
                // god mode
                break;
            default:
                console.log("Ability Use Attempted.");
                console.log(ability_arr[i]);
        }
    }
    createPlayerData( function(cb) {
        res.writeHead(200, {
            'Content-Type': 'application/octet-stream'
        });
        res.end(cb.toBuffer(), 'binary');
    });
});

function ticker() {
    
}

//Create a server
//generateMonstersRound(1, function(){    });
var server = app.listen(80, function() {
      var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});