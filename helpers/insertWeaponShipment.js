// const WeaponShipment = require('../models/weapon_shipments');
// const crypto = require('crypto');

// // Function to generate a unique OrderID
// function generateOrderID(serverName) {
//   return `${serverName}-${crypto.randomBytes(4).toString('hex')}`;
// }

// // Function to insert the shipment data into the database
// async function insertWeaponShipment(jsonData, verifierId, requesterId, ticketId) {
//   try {
//     const OrderID = generateOrderID(jsonData.Server);

//     await WeaponShipment.create({
//       OrderID,
//       TargetDiscordID: jsonData.TargetDiscordID,
//       Verifier: verifierId || null, // Set verifier from approval
//       TicketID: ticketId || null,   // Set ticket ID (channel/message)
//       ShipmentRequester: requesterId || '123456789', // Set the user who ran the command
//       Server: jsonData.Server || 'default_server',
//       Status: jsonData.Status || 1,
//       BP_WEAPON_BAS_P_RED: jsonData.BP_WEAPON_BAS_P_RED || 0,
//       BP_WEAPON_BULLPUP_SMG: jsonData.BP_WEAPON_BULLPUP_SMG || 0,
//       BP_WEAPON_GRAUV2: jsonData.BP_WEAPON_GRAUV2 || 0,
//       BP_WEAPON_ISYV2: jsonData.BP_WEAPON_ISYV2 || 0,
//       BP_WEAPON_HK516V2: jsonData.BP_WEAPON_HK516V2 || 0,
//       BP_WEAPON_L85: jsonData.BP_WEAPON_L85 || 0,
//       BP_WEAPON_LMTM4R: jsonData.BP_WEAPON_LMTM4R || 0,
//       BP_WEAPON_M133V3: jsonData.BP_WEAPON_M133V3 || 0,
//       BP_WEAPON_M4A5V2: jsonData.BP_WEAPON_M4A5V2 || 0,
//       BP_WEAPON_M4ASIIMOV: jsonData.BP_WEAPON_M4ASIIMOV || 0,
//       BP_WEAPON_NVRIFLE_PURPLE: jsonData.BP_WEAPON_NVRIFLE_PURPLE || 0,
//       BP_WEAPON_SCAR_L: jsonData.BP_WEAPON_SCAR_L || 0,
//       BP_WEAPON_XM7_6_8: jsonData.BP_WEAPON_XM7_6_8 || 0,
//       WEAPON_DDM4V5: jsonData.WEAPON_DDM4V5 || 0,
//       WEAPON_AK47_ASIIMOV: jsonData.WEAPON_AK47_ASIIMOV || 0,
//       WEAPON_AK47_NIGHTWISH: jsonData.WEAPON_AK47_NIGHTWISH || 0,
//       WEAPON_BERYL_762: jsonData.WEAPON_BERYL_762 || 0,
//       WEAPON_GALILARV2: jsonData.WEAPON_GALILARV2 || 0,
//       WEAPON_GAU_5A: jsonData.WEAPON_GAU_5A || 0,
//       WEAPON_HOWAT20: jsonData.WEAPON_HOWAT20 || 0,
//       WEAPON_M47V2: jsonData.WEAPON_M47V2 || 0,
//       WEAPON_M4_T_NEON: jsonData.WEAPON_M4_T_NEON || 0,
//       WEAPON_MP5: jsonData.WEAPON_MP5 || 0,
//       WEAPON_NVRIFLE: jsonData.WEAPON_NVRIFLE || 0,
//       WEAPON_P20_ASIIMOV: jsonData.WEAPON_P20_ASIIMOV || 0,
//       WEAPON_SCEVO: jsonData.WEAPON_SCEVO || 0,
//       WEAPON_UMP: jsonData.WEAPON_UMP || 0,
//       WEAPON_R90: jsonData.WEAPON_R90 || 0,
//       WEAPON_ZIPTIE: jsonData.WEAPON_ZIPTIE || 0,
//       WEAPON_GLOCK40S: jsonData.WEAPON_GLOCK40S || 0,
//       WEAPON_MI9: jsonData.WEAPON_MI9 || 0,
//       WEAPON_TEC9: jsonData.WEAPON_TEC9 || 0,
//       WEAPON_SP: jsonData.WEAPON_SP || 0,
//       WEAPON_ARPISTOL: jsonData.WEAPON_ARPISTOL || 0,
//       WEAPON_PLR: jsonData.WEAPON_PLR || 0,
//       WEAPON_MPX: jsonData.WEAPON_MPX || 0,
//       WEAPON_LOK: jsonData.WEAPON_LOK || 0,
//       WEAPON_GLOCK19S: jsonData.WEAPON_GLOCK19S || 0,
//       WEAPON_ASVAL: jsonData.WEAPON_ASVAL || 0,
//       WEAPON_GLOCK17S: jsonData.WEAPON_GLOCK17S || 0,
//       WEAPON_GLOCK26S: jsonData.WEAPON_GLOCK26S || 0,
//       WEAPON_APS: jsonData.WEAPON_APS || 0,
//       WEAPON_FAMAS: jsonData.WEAPON_FAMAS || 0,
//       WEAPON_FAMAS_YELLOW: jsonData.WEAPON_FAMAS_YELLOW || 0,
//       WEAPON_HKUSP: jsonData.WEAPON_HKUSP || 0,
//       WEAPON_M270D: jsonData.WEAPON_M270D || 0,
//       WEAPON_M27S: jsonData.WEAPON_M27S || 0,
//       WEAPON_M4A1_MOD: jsonData.WEAPON_M4A1_MOD || 0,
//       WEAPON_M4_A_W: jsonData.WEAPON_M4_A_W || 0,
//       WEAPON_MODULAR_RIFLE: jsonData.WEAPON_MODULAR_RIFLE || 0,
//       WEAPON_VECTOR: jsonData.WEAPON_VECTOR || 0,
//       WEAPON_BARP: jsonData.WEAPON_BARP || 0,
//       WEAPON_MICRODRACO: jsonData.WEAPON_MICRODRACO || 0,
//       WEAPON_DESERT_EAGLE: jsonData.WEAPON_DESERT_EAGLE || 0,
//       WEAPON_P250_ASIIMOV: jsonData.WEAPON_P250_ASIIMOV || 0,
//       WEAPON_MAC10: jsonData.WEAPON_MAC10 || 0,
//       WEAPON_MP7: jsonData.WEAPON_MP7 || 0,
//     });

//     console.log(`Order ${OrderID} inserted successfully!`);
//   } catch (error) {
//     console.error('Error inserting shipment:', error);
//   }
// }

// module.exports = { insertWeaponShipment };
