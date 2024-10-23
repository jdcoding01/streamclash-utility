const { Sequelize } = require('sequelize');
const models = require("../models");

const PlayerLink = models.drx_mdt_player_link;
const Users = models.users;
const fs = require('fs');

async function fetchCharactersByLicenseValley(license) {
    const queries = [
        Users.findAll({ where: { identifier: `char1:${license}` } }),
        Users.findAll({ where: { identifier: `char2:${license}` } }),
        Users.findAll({ where: { identifier: `char3:${license}` } }),
        Users.findAll({ where: { identifier: `char4:${license}` } }),
        Users.findAll({ where: { identifier: `char5:${license}` } })
    ];

    const results = await Promise.all(queries); // Run all queries in parallel
    const characters = [];

    // Use a for...of loop to handle async operations
    for (const result of results) {
        if (result.length > 0) {
            for (const character of result) {
                const stateIdResult = await PlayerLink.findAll({ where: { identifier: character.identifier } });

                characters.push({
                    identifier: character.identifier,
                    stateId: stateIdResult.length > 0 ? stateIdResult[0].stateid : null, // Check if stateId exists
                    first_name: character.firstname,
                    last_name: character.lastname,
                    created_at: character.created_at,
                    last_seen: character.last_seen
                });
            }
        }
    }

    return characters; // Return the array of character objects
}


async function transferLicenseValleyCharacter(oldLicense, newLicense, ) {

    const sequelize = new Sequelize('', '', '', {
        host: '',
        dialect: 'mysql'
    });

    // License queries
    try {
        const queries = [
            { tableName: 'addon_account_data', column: 'owner' },
            { tableName: 'ak47_housing', column: 'owner' },
            { tableName: 'ak47_housing', column: 'access' },
            { tableName: 'banking_loans', column: 'player_id' },
            { tableName: 'banking_users', column: 'identifier' },
            { tableName: 'basketball_rpg', column: 'identifier' },
            { tableName: 'billing', column: 'identifier' },
            { tableName: 'cdev_pets', column: 'owner' },
            { tableName: 'comp_requests', column: 'character_id' },
            { tableName: 'dealership_employees', column: 'identifier' },
            { tableName: 'dealership_sales', column: 'player' },
            { tableName: 'drunk_stats', column: 'identifier' },
            { tableName: 'drx_mdt_player_link', column: 'identifier' },
            { tableName: 'dynasty_miner', column: 'identifier' },
            { tableName: 'fishing_players', column: 'identifier' },
            { tableName: 'gangblocks', column: 'owner' },
            { tableName: 'gangs', column: 'identifier' },
            { tableName: 'gang_zones', column: 'gang_id' },
            { tableName: 'golf_memberships', column: 'user' },
            { tableName: 'hud_settings', column: 'citizenid' },
            { tableName: 'k9', column: 'identifier' },
            { tableName: 'kub_truckingcontracts', column: 'citizenid' },
            { tableName: 'kub_truckingplayervehicles', column: 'citizenid' },
            { tableName: 'kub_truckingprofile', column: 'citizenid' },
            { tableName: 'laundrymat', column: 'owner' },
            { tableName: 'lost_laundry', column: 'owner' },
            { tableName: 'mw_crafting', column: 'owner' },
            { tableName: 'okokbilling', column: 'receiver_identifier' },
            { tableName: 'okokbilling', column: 'author_identifier' },
            { tableName: 'owned_vehicles', column: 'owner' },
            { tableName: 'ox_inventory', column: 'owner' },
            { tableName: 'player_blueprints', column: 'identifier' },
            { tableName: 'player_outfits', column: 'citizenid' },
            { tableName: 'player_xp', column: 'identifier' },
            { tableName: 'ra_boosting_contracts', column: 'owner_identifier' },
            { tableName: 'ra_boosting_user_settings', column: 'player_identifier' },
            { tableName: 'ra_racing_races', column: 'started_by_identifier' },
            { tableName: 'ra_racing_results', column: 'player_identifier' },
            { tableName: 'ra_racing_user_settings', column: 'player_identifier' },
            { tableName: 'rcore_prison', column: 'owner' },
            { tableName: 'rcore_prison_accounts', column: 'owner' },
            { tableName: 'rcore_prison_accounts_log', column: 'charId' },
            { tableName: 'rcore_prison_logs', column: 'charId' },
            { tableName: 'rcore_prison_stash', column: 'owner' },
            { tableName: 'rcore_tattoos', column: 'identifier' },
            { tableName: 'snipe_apartments', column: 'identifier' },
            { tableName: 'snipe_apartments_furniture', column: 'identifier' },
            { tableName: 'snipe_apartments_stashoutfit', column: 'identifier' },
            { tableName: 'snipe_apartments_state', column: 'identifier' },
            { tableName: 'snipe_furniture_stash', column: 'identifier' },
            { tableName: 'snipe_moonshine', column: 'identifier' },
            { tableName: 'snipe_moonshine_data', column: 'identifier' },
            { tableName: 'sprays', column: 'identifier' },
            { tableName: 'wasabi_fingerprints', column: 'identifier' },
            { tableName: 'zerio_radio_contacts', column: 'identifier' },
            { tableName: 'zerio_radio_favorites', column: 'identifier' },
            { tableName: 'zerio_radio_messages', column: 'sender' },
            { tableName: 'zerio_radio_messages', column: 'receiver' },
            { tableName: 'zerio_radio_recents', column: 'identifier' },
            { tableName: 'zerio_radio_settings', column: 'identifier' },
            { tableName: 'user_licenses', column: 'owner' },
            { tableName: 'users', column: 'identifier' },
            { tableName: 'phone_phones', column: 'owner_id', phone: true },
            { tableName: 'player_houses', column: 'citizenid' },
            { tableName: 'player_houses', column: 'owner' },
            { tableName: 'player_houses', column: 'keyholders' },
        ];

        for (let query of queries) {
            // Fetch
            const sql = `SELECT * FROM ${query.tableName} WHERE ${query.column} = :license`;
            const results = await sequelize.query(sql, {
                replacements: { license },
                type: sequelize.QueryTypes.SELECT
            });

            if (results.length > 0) {
                const identifier = `${license.split(":")[0]}:${Date.now()}`;
                const updateSql = `UPDATE ${query.tableName} SET ${query.column} = :newLicense WHERE ${query.column} = :license`;
                await sequelize.query(updateSql, {
                    replacements: { newLicense: `${license.split(":")[0]}:${Date.now()}`, license },
                    type: sequelize.QueryTypes.UPDATE
                });

                console.log(`Updated ${query.tableName}.${query.column} from ${license} to ${license.split(":")[0]}:${Date.now()}`);
                addLog(`Deleted records from ${query.tableName} for ${query.column} = ${license}`);
            } else {
                addLog(`No results found for ${query.tableName} with ${query.column} = ${license}`);
            }
        }
    } catch (error) {
        console.error('Error executing queries:', error);
    }
}


module.exports = { transferLicenseValleyCharacter, fetchCharactersByLicenseValley };