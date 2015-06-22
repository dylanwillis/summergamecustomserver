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

function takeFromMonsterHP(num_clicks, player_id)
{
    var lane = getPlayerLaneAndClickDamage(player_id, function(lane, dmg){
    switch(lane) {
        case 0:
            first_enemy_hp = first_enemy_hp - (num_clicks*dmg);
            if(first_enemy_hp <= 0) {
                increasePlayerGold(5000, 12345678);
            }
            break;
        case 1:
            second_enemy_hp = second_enemy_hp - (num_clicks*dmg);
            if(second_enemy_hp <= 0) {
                increasePlayerGold(5000, 12345678);
            }
            break;
        case 2:
            third_enemy_hp = third_enemy_hp - (num_clicks*dmg);
            if(third_enemy_hp <= 0) {
                increasePlayerGold(5000, 12345678);
            }
            break;
        default:
            console.log("hax player not in a lane" + lane);
        }
    });
}

function purchaseUpgradePlayer(upgrade_arr, player_id, callback){
    db.each("SELECT * FROM tech WHERE player_id = "+player_id+" AND tech_id = "+upgrade_arr, function(err, row){
        console.log(row);
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
                        console.log()
                        callback();
                    });
                });
            });
        });
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
    db.run('UPDATE player SET player.target = '+target+' WHERE player_id = '+player_id);
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

var first_enemy_hp = 1000;
var second_enemy_hp = 1000;
var third_enemy_hp = 1000;

function createGameData (callback) {
    var game_data = {'game_data': {level: 1, lanes: {}, timestamp: 0, status: 2, events: [], timestamp_game_start: 0, timestamp_level_start: 0, universe_state: null}};
    var lanes = {enemies: [{id: 101749, type:2, hp: 1000, max_hp: 1000, dps: 10, gold: 5000} ], dps: 0, gold_dropped: null, active_player_abilities: [], player_hp_buckets: [0,0,0,0,0,0,0,0,0,1], element: 4, active_player_ability_decrease_cooldowns: 0, active_player_ability_gold_per_click: 0};
    var lanes2 = {enemies: [{id: 101750, type:2, hp: 1000, max_hp: 1000, dps: 10, gold: 5000} ], dps: 0, gold_dropped: null, active_player_abilities: [], player_hp_buckets: [0,0,0,0,0,0,0,0,0,1], element: 4, active_player_ability_decrease_cooldowns: 0, active_player_ability_gold_per_click: 0};
    var lanes3 = {enemies: [{id: 101751, type:2, hp: 1000, max_hp: 1000, dps: 10, gold: 5000} ], dps: 0, gold_dropped: null, active_player_abilities: [], player_hp_buckets: [0,0,0,0,0,0,0,0,0,1], element: 4, active_player_ability_decrease_cooldowns: 0, active_player_ability_gold_per_click: 0};
    lanes.enemies[0].hp = first_enemy_hp;
    lanes2.enemies[0].hp = second_enemy_hp;
    lanes3.enemies[0].hp = third_enemy_hp;
    game_data.game_data.lanes = [lanes, lanes2, lanes3];
    game_data.game_data.timestamp = Math.round(+new Date()/1000);
    game_data.game_data.timestamp_game_start = Math.round(+new Date()/1000)-10;
    game_data.game_data.timestamp_level_start = Math.round(+new Date()/1000)-10;
    game_data.stats = null;
    var encmsg = m_protobuf_GetGameDataResponse.encode(game_data);
    callback(encmsg);
}

//For all your static (js/css/images/etc.) set the directory name (relative path).
app.use(express.static('public'));

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
                getPlayerLaneAndClickDamage(12345678, function(curr_lane,click_damage){
                switch(curr_lane) {
                    case 0:
                        first_enemy_hp = first_enemy_hp - (first_enemy_hp*0.05*Math.random());
                        if(first_enemy_hp <= 0) {
                            gold = gold + 5000;
                        }
                        break;
                    case 1:
                        second_enemy_hp = second_enemy_hp - (first_enemy_hp*0.05*Math.random());
                                                if(first_enemy_hp <= 0) {
                            gold = gold + 5000;
                        }
                        break;
                    case 2:
                        third_enemy_hp = third_enemy_hp - (first_enemy_hp*0.05*Math.random());
                        console.log((first_enemy_hp*0.05*Math.random()));
                                                if(first_enemy_hp <= 0) {
                            gold = gold + 5000;
                        }
                        break;
                    default:
                        console.log("hax player not in a lane");
                    }
                });
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



//Create a server
var server = app.listen(80, function() {
      var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});