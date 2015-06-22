module.exports = {
  createPlayerData: function (callback) {
    createPlayerData(callback);
  },
  createGameData: function (callback) {
    createGameData(callback);
  },
  createGetPlayerNames: function (callback) {
  	createGetPlayerNames(callback);
  }
};

var ProtoBuf = require("protobufjs"),
    ByteBuffer = ProtoBuf.ByteBuffer,                    // ProtoBuf.js uses and also exposes ByteBuffer.js
    Long = ProtoBuf.Long,
    fs = require('fs');

var builder = ProtoBuf.loadProtoFile("messages.proto");
	var m_protobuf_GetGameDataResponse = builder.build( "CTowerAttack_GetGameData_Response" );
	var m_protobuf_GetPlayerNamesResponse = builder.build( "CTowerAttack_GetPlayerNames_Response" );
	var m_protobuf_GetPlayerDataResponse = builder.build( "CTowerAttack_GetPlayerData_Response" );
	var m_protobuf_UseAbilitiesResponse = builder.build( "CTowerAttack_UseAbilities_Response" );
	var m_protobuf_ChooseUpgradeResponse = builder.build( "CTowerAttack_ChooseUpgrade_Response" );
	var m_protobuf_UseBadgePointsResponse = builder.build( "CTowerAttack_UseBadgePoints_Response" );


fs.readFile('./buffy', function(err, data) {
	if(err) {
	throw err;
	}
	//console.log(data);
	var msg = m_protobuf_GetPlayerDataResponse.decode(data);
	console.log(msg);
});

function createPlayerData (callback) {
	var player_data = {'player_data': {hp: 1000, current_lane: 1, target: 0, time_died: null, gold: 0, active_abilities_bitfield: {low: 0, high: 0, unsigned: true }, active_abilities: [], crit_damage: 0, loot: [] }, tech_tree: null};
	var encmsg = m_protobuf_GetPlayerDataResponse.encode(player_data);
	callback(encmsg);
};

function createGetPlayerNames(callback) {
	var playname = {'names': [{accountid: 39160019, name: "Reasonably Priced Corgi"}]};
	var encmsg = m_protobuf_GetPlayerNamesResponse.encode(playname);
	callback(encmsg);
}

function createGameData (callback) {
	var game_data = {'game_data': {level: 1, lanes: {}, timestamp: 0, status: 2, events: [], timestamp_game_start: 0, timestamp_level_start: 0, universe_state: null}};
	var lanes = {enemies: [{id: { low: 0, high: 0, unsigned:true}, type:0, hp: 1000, max_hp: 1000, dps: 0, timer: null, gold: 5000} ], dps: 0, gold_dropped: null, active_player_abilities: [], player_hp_buckets: [0,0,0,0,0,0,0,0,0,1], element: 4, active_player_ability_decrease_cooldowns: 0, active_player_ability_gold_per_click: 0};
	var lanes2 = {enemies: [{id: { low: 1, high: 0, unsigned:true}, type:0, hp: 1000, max_hp: 1000, dps: 0, timer: null, gold: 5000} ], dps: 0, gold_dropped: null, active_player_abilities: [], player_hp_buckets: [0,0,0,0,0,0,0,0,0,1], element: 4, active_player_ability_decrease_cooldowns: 0, active_player_ability_gold_per_click: 0};
	var lanes3 = {enemies: [{id: { low: 2, high: 0, unsigned:true}, type:0, hp: 1000, max_hp: 1000, dps: 0, timer: null, gold: 5000} ], dps: 0, gold_dropped: null, active_player_abilities: [], player_hp_buckets: [0,0,0,0,0,0,0,0,0,1], element: 4, active_player_ability_decrease_cooldowns: 0, active_player_ability_gold_per_click: 0};
	game_data.game_data.lanes = [lanes, lanes2, lanes3];
	game_data.game_data.timestamp = Math.round(+new Date()/1000);
	game_data.game_data.timestamp_game_start = Math.round(+new Date()/1000)-10;
	game_data.game_data.timestamp_level_start = Math.round(+new Date()/1000)-10;
	game_data.stats = null;
	var encmsg = m_protobuf_GetGameDataResponse.encode(game_data);
	callback(encmsg);
};

createGetPlayerNames(function(enc){
	//console.log(m_protobuf_GetPlayerNamesResponse.decode(enc));
});

createPlayerData(function(enc){
	//console.log(m_protobuf_GetPlayerDataResponse.decode(enc));
});

createGameData(function(enc){
	//console.log(m_protobuf_GetGameDataResponse.decode(enc).game_data.lanes[0]);
});
//console.log(m_protobuf_GetGameDataResponse.decode(encmsg));
//console.log(game_data.game_data.lanes);
