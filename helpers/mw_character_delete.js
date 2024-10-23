const { Op } = require('sequelize'); // Sequelize operator
const models = require("../mwModels");

const PlayerLink = models.drx_mdt_player_link;
const Users = models.users;
const fs = require('fs');

async function fetchCharactersByLicense(license) {
    const queries = [
        Users.findAll({ where: { identifier: `char1:${license}` } }),
        Users.findAll({ where: { identifier: `char2:${license}` } }),
        Users.findAll({ where: { identifier: `char3:${license}` } }),
        Users.findAll({ where: { identifier: `char4:${license}` } }),
        Users.findAll({ where: { identifier: `char5:${license}` } })
    ];

    const results = await Promise.all(queries); // Run all queries in parallel
    const characters = [];

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




async function deleteMostWantedCharacter(license, addLog) {

    const stateId = await PlayerLink.findAll({ where: { identifier: license } });

    async function addToBackup(data, tableName) {
        const entry = { data: data, tableName: tableName };
        
        const dataToAppend = JSON.stringify(entry, null, 2);

            try {
                await fs.promises.appendFile(`backups/${license.split(":")[0]}-${license.split(":")[1]}.txt`, dataToAppend + '\n');
                console.log('Data successfully appended to file');
            } catch (err) {
                console.error('Error appending to file', err);
            }
        
    }

    // License queries
    try {
        const queries = [
            { model: models.addon_account_data, column: 'owner', tableName: 'addon_account_data' },
            { model: models.ak47_housing, column: 'owner', tableName: 'ak47_housing' },
            { model: models.ak47_housing, column: 'access', tableName: 'ak47_housing' },
            { model: models.banking_loans, column: 'player_id', tableName: 'banking_loans' },
            { model: models.banking_users, column: 'identifier', tableName: 'banking_users' },
            { model: models.basketball_rpg, column: 'identifier', tableName: 'basketball_rpg' },
            { model: models.billing, column: 'identifier', tableName: 'billing' },
            { model: models.cdev_pets, column: 'owner', tableName: 'cdev_pets' },
            { model: models.comp_requests, column: 'character_id', tableName: 'comp_requests' },
            { model: models.dealership_employees, column: 'identifier', tableName: 'dealership_employees' },
            { model: models.dealership_sales, column: 'player', tableName: 'dealership_sales' },
            { model: models.drunk_stats, column: 'identifier', tableName: 'drunk_stats' },
            { model: models.drx_mdt_player_link, column: 'identifier', tableName: 'drx_mdt_player_link' },
            { model: models.dynasty_miner, column: 'identifier', tableName: 'dynasty_miner' },
            { model: models.fishing_players, column: 'identifier', tableName: 'fishing_players' },
            { model: models.gangblocks, column: 'owner', tableName: 'gangblocks' },
            { model: models.gangs, column: 'identifier', tableName: 'gangs' },
            { model: models.gang_zones, column: 'gang_id', tableName: 'gang_zones' },
            { model: models.golf_memberships, column: 'user', tableName: 'golf_memberships' },
            { model: models.hud_settings, column: 'citizenid', tableName: 'hud_settings' },
            { model: models.k9, column: 'identifier', tableName: 'k9' },
            { model: models.kub_truckingcontracts, column: 'citizenid', tableName: 'kub_truckingcontracts' },
            { model: models.kub_truckingplayervehicles, column: 'citizenid', tableName: 'kub_truckingplayervehicles' },
            { model: models.kub_truckingprofile, column: 'citizenid', tableName: 'kub_truckingprofile' },
            { model: models.laundrymat, column: 'owner', tableName: 'laundrymat' },
            { model: models.lost_laundry, column: 'owner', tableName: 'lost_laundry' },
            { model: models.mw_crafting, column: 'owner', tableName: 'mw_crafting' },
            { model: models.okokbilling, column: 'receiver_identifier', tableName: 'okokbilling' },
            { model: models.okokbilling, column: 'author_identifier', tableName: 'okokbilling' },
            { model: models.owned_vehicles, column: 'owner', tableName: 'owned_vehicles' },
            { model: models.ox_inventory, column: 'owner', tableName: 'ox_inventory' },
            { model: models.player_blueprints, column: 'identifier', tableName: 'player_blueprints' },
            { model: models.player_outfits, column: 'citizenid', tableName: 'player_outfits' },
            { model: models.player_xp, column: 'identifier', tableName: 'player_xp' },
            { model: models.ra_boosting_contracts, column: 'owner_identifier', tableName: 'ra_boosting_contracts' },
            { model: models.ra_boosting_user_settings, column: 'player_identifier', tableName: 'ra_boosting_user_settings' },
            { model: models.ra_racing_races, column: 'started_by_identifier', tableName: 'ra_racing_races' },
            { model: models.ra_racing_results, column: 'player_identifier', tableName: 'ra_racing_results' },
            { model: models.ra_racing_user_settings, column: 'player_identifier', tableName: 'ra_racing_user_settings' },
            { model: models.rcore_prison, column: 'owner', tableName: 'rcore_prison' },
            { model: models.rcore_prison_accounts, column: 'owner', tableName: 'rcore_prison_accounts' },
            { model: models.rcore_prison_accounts_log, column: 'charId', tableName: 'rcore_prison_accounts_log' },
            { model: models.rcore_prison_logs, column: 'charId', tableName: 'rcore_prison_logs' },
            { model: models.rcore_prison_stash, column: 'owner', tableName: 'rcore_prison_stash' },
            { model: models.rcore_tattoos, column: 'identifier', tableName: 'rcore_tattoos' },
            { model: models.snipe_apartments, column: 'identifier', tableName: 'snipe_apartments' },
            { model: models.snipe_apartments_furniture, column: 'identifier', tableName: 'snipe_apartments_furniture' },
            { model: models.snipe_apartments_stashoutfit, column: 'identifier', tableName: 'snipe_apartments_stashoutfit' },
            { model: models.snipe_apartments_state, column: 'identifier', tableName: 'snipe_apartments_state' },
            { model: models.snipe_furniture_stash, column: 'identifier', tableName: 'snipe_furniture_stash' },
            { model: models.snipe_moonshine, column: 'identifier', tableName: 'snipe_moonshine' },
            { model: models.snipe_moonshine_data, column: 'identifier', tableName: 'snipe_moonshine_data' },
            { model: models.sprays, column: 'identifier', tableName: 'sprays' },
            { model: models.wasabi_fingerprints, column: 'identifier', tableName: 'wasabi_fingerprints' },
            { model: models.zerio_radio_contacts, column: 'identifier', tableName: 'zerio_radio_contacts' },
            { model: models.zerio_radio_favorites, column: 'identifier', tableName: 'zerio_radio_favorites' },
            { model: models.zerio_radio_messages, column: 'sender', tableName: 'zerio_radio_messages' },
            { model: models.zerio_radio_messages, column: 'receiver', tableName: 'zerio_radio_messages' },
            { model: models.zerio_radio_recents, column: 'identifier', tableName: 'zerio_radio_recents' },
            { model: models.zerio_radio_settings, column: 'identifier', tableName: 'zerio_radio_settings' },
            { model: models.user_licenses, column: 'owner', tableName: 'user_licenses' },
            { model: models.users, column: 'identifier', tableName: 'users' },
            { model: models.phone_phones, column: 'owner_id', phone: true, tableName: 'phone_phones' },
            { model: models.player_houses, column: 'citizenid', tableName: 'player_houses' },
            { model: models.player_houses, column: 'owner', tableName: 'player_houses' },
            { model: models.player_houses, column: 'keyholders', tableName: 'player_houses' },
        ];

        // Loop through each query configuration and perform the findAll operation
        // Step 1: Fetch the current value of the access column using a raw query
        const house = await models.sequelize.query(
            `SELECT access FROM ak47_housing WHERE JSON_CONTAINS_PATH(access, 'one', '$."${license}"')`,
            { type: models.sequelize.QueryTypes.SELECT }
        );

        if (house.length > 0 && house[0].access) {
            // Step 2: Parse the access JSON string into an object
            let accessData = JSON.parse(house[0].access);

            // Step 3: Remove the specified license object from the accessData
            delete accessData[license];

            // Step 4: Reinsert the updated accessData back into the access column as a string
            await models.ak47_housing.update(
                { access: JSON.stringify(accessData) }, // Convert the modified accessData back to a JSON string
                {
                    where: models.sequelize.literal(`JSON_CONTAINS_PATH(access, 'one', '$."${license}"')`)
                }
            );
        }
        for (let query of queries) {
            if (query.tableName === "phone_phones") {
                const phoneResults = await query.model.findAll({ where: { owner_id: license } });

                if (phoneResults.length > 0) {
                    const phone_number = phoneResults[0].phone_number;

                    // phone_phones, phone_number
                    const bk1 = await models.phone_phones.findAll({ where: { phone_number: phone_number } });
                    addToBackup(bk1[0], "phone_phones");
                    await models.phone_phones.destroy({ where: { phone_number: phone_number } });
                    addLog(`Deleted records from phone_phones for phone number: ${phone_number}`);

                    // phone_backups, id (license)
                    const bk2 = await models.phone_backups.findAll({ where: { id: phone_number } });
                    addToBackup(bk2[0], "phone_backups");
                    await models.phone_backups.destroy({ where: { id: phone_number } });
                    addLog(`Deleted records from phone_backups for id: ${phone_number}`);

                    // Add destroy for other phone-related models
                    const bk3 = await models.phone_clock_alarms.findAll({ where: { phone_number: phone_number } });
                    addToBackup(bk3[0], "phone_clock_alarms");
                    await models.phone_clock_alarms.destroy({ where: { phone_number: phone_number } });
                    addLog(`Deleted records from phone_clock_alarms for phone number: ${phone_number}`);

                    const bk4 = await models.phone_darkchat_accounts.findAll({ where: { phone_number: phone_number } });
                    addToBackup(bk4[0], "phone_darkchat_accounts");
                    await models.phone_darkchat_accounts.destroy({ where: { phone_number: phone_number } });
                    addLog(`Deleted records from phone_darkchat_accounts for phone number: ${phone_number}`);

                    const bk5 = await models.phone_instagram_accounts.findAll({ where: { phone_number: phone_number } });
                    addToBackup(bk5[0], "phone_instagram_accounts");
                    await models.phone_instagram_accounts.destroy({ where: { phone_number: phone_number } });
                    addLog(`Deleted records from phone_instagram_accounts for phone number: ${phone_number}`);

                    // phone_last_phone, id (license)
                    const bk6 = await models.phone_last_phone.findAll({
                        where: { id: phone_number } // Using phone_number as license
                    });
                    addToBackup(bk6[0], "phone_last_phone");
                    await models.phone_last_phone.destroy({
                        where: { id: phone_number } // Using phone_number as license
                    });
                    addLog(`Deleted records from phone_last_phone for id: ${phone_number}`);

                    // phone_logged_in_accounts, phone_number
                    const bk7 = await models.phone_logged_in_accounts.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk7[0], "phone_logged_in_accounts");
                    await models.phone_logged_in_accounts.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_logged_in_accounts for phone number: ${phone_number}`);

                    // phone_maps_locations, phone_number
                    const bk8 = await models.phone_maps_locations.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk8[0], "phone_maps_locations");
                    await models.phone_maps_locations.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_maps_locations for phone number: ${phone_number}`);

                    // phone_marketplace_posts, phone_number
                    const bk9 = await models.phone_marketplace_posts.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk9[0], "phone_marketplace_posts");
                    await models.phone_marketplace_posts.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_marketplace_posts for phone number: ${phone_number}`);

                    // phone_message_members, phone_number
                    const bk10 = await models.phone_message_members.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk10[0], "phone_message_members");
                    await models.phone_message_members.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_message_members for phone number: ${phone_number}`);

                    // phone_message_messages, sender
                    const bk11 = await models.phone_message_messages.findAll({
                        where: { sender: phone_number }
                    });
                    addToBackup(bk11[0], "phone_message_messages");
                    await models.phone_message_messages.destroy({
                        where: { sender: phone_number }
                    });
                    addLog(`Deleted records from phone_message_messages for sender: ${phone_number}`);

                    // phone_music_playlists, phone_number
                    const bk12 = await models.phone_music_playlists.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk12[0], "phone_music_playlists");
                    await models.phone_music_playlists.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_music_playlists for phone number: ${phone_number}`);

                    // phone_music_saved_playlists, phone_number
                    const bk13 = await models.phone_music_saved_playlists.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk13[0], "phone_music_saved_playlists");
                    await models.phone_music_saved_playlists.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_music_saved_playlists for phone number: ${phone_number}`);

                    // phone_notes, phone_number
                    const bk14 = await models.phone_notes.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk14[0], "phone_notes");
                    await models.phone_notes.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_notes for phone number: ${phone_number}`);

                    // phone_notifications, phone_number
                    const bk15 = await models.phone_notifications.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk15[0], "phone_notifications");
                    await models.phone_notifications.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_notifications for phone number: ${phone_number}`);

                    // phone_phone_blocked_numbers, phone_number
                    const bk16 = await models.phone_phone_blocked_numbers.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk16[0], "phone_phone_blocked_numbers");
                    await models.phone_phone_blocked_numbers.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_phone_blocked_numbers for phone number: ${phone_number}`);

                    // phone_phone_blocked_numbers, blocked_number
                    const bk17 = await models.phone_phone_blocked_numbers.findAll({
                        where: { blocked_number: phone_number }
                    });
                    addToBackup(bk17[0], "phone_phone_blocked_numbers");
                    await models.phone_phone_blocked_numbers.destroy({
                        where: { blocked_number: phone_number }
                    });
                    addLog(`Deleted records from phone_phone_blocked_numbers for blocked number: ${phone_number}`);

                    // phone_phone_calls, caller
                    const bk18 = await models.phone_phone_calls.findAll({
                        where: { caller: phone_number }
                    });
                    addToBackup(bk18[0], "phone_phone_calls");
                    await models.phone_phone_calls.destroy({
                        where: { caller: phone_number }
                    });
                    addLog(`Deleted records from phone_phone_calls for caller: ${phone_number}`);

                    // phone_phone_calls, callee
                    const bk19 = await models.phone_phone_calls.findAll({
                        where: { callee: phone_number }
                    });
                    addToBackup(bk19[0], "phone_phone_calls");
                    await models.phone_phone_calls.destroy({
                        where: { callee: phone_number }
                    });
                    addLog(`Deleted records from phone_phone_calls for callee: ${phone_number}`);

                    // phone_phone_contacts, contact_phone_number
                    const bk20 = await models.phone_phone_contacts.findAll({
                        where: { contact_phone_number: phone_number }
                    });
                    addToBackup(bk20[0], "phone_phone_contacts");
                    await models.phone_phone_contacts.destroy({
                        where: { contact_phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_phone_contacts for contact_phone_number: ${phone_number}`);

                    // phone_phone_contacts, phone_number
                    const bk21 = await models.phone_phone_contacts.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk21[0], "phone_phone_contacts");
                    await models.phone_phone_contacts.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_phone_contacts for phone number: ${phone_number}`);

                    // phone_phone_voicemail, caller
                    const bk22 = await models.phone_phone_voicemail.findAll({
                        where: { caller: phone_number }
                    });
                    addToBackup(bk22[0], "phone_phone_voicemail");
                    await models.phone_phone_voicemail.destroy({
                        where: { caller: phone_number }
                    });
                    addLog(`Deleted records from phone_phone_voicemail for caller: ${phone_number}`);

                    // phone_phone_voicemail, callee
                    const bk23 = await models.phone_phone_voicemail.findAll({
                        where: { callee: phone_number }
                    });
                    addToBackup(bk23[0], "phone_phone_voicemail");
                    await models.phone_phone_voicemail.destroy({
                        where: { callee: phone_number }
                    });
                    addLog(`Deleted records from phone_phone_voicemail for callee: ${phone_number}`);

                    // phone_photos, phone_number
                    const bk24 = await models.phone_photos.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk24[0], "phone_photos");
                    await models.phone_photos.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_photos for phone number: ${phone_number}`);

                    // phone_photo_albums, phone_number
                    const bk25 = await models.phone_photo_albums.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk25[0], "phone_photo_albums");
                    await models.phone_photo_albums.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_photo_albums for phone number: ${phone_number}`);

                    // phone_services_channels, phone_number
                    const bk26 = await models.phone_services_channels.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk26[0], "phone_services_channels");
                    await models.phone_services_channels.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_services_channels for phone number: ${phone_number}`);

                    // phone_services_messages, sender
                    const bk27 = await models.phone_services_messages.findAll({
                        where: { sender: phone_number }
                    });
                    addToBackup(bk27[0], "phone_services_messages");
                    await models.phone_services_messages.destroy({
                        where: { sender: phone_number }
                    });
                    addLog(`Deleted records from phone_services_messages for sender: ${phone_number}`);

                    // phone_tiktok_accounts, phone_number
                    const bk28 = await models.phone_tiktok_accounts.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk28[0], "phone_tiktok_accounts");
                    await models.phone_tiktok_accounts.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_tiktok_accounts for phone number: ${phone_number}`);

                    // phone_tinder_accounts, phone_number
                    const bk29 = await models.phone_tinder_accounts.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk29[0], "phone_tinder_accounts");
                    await models.phone_tinder_accounts.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_tinder_accounts for phone number: ${phone_number}`);

                    // phone_tinder_matches, phone_number_1
                    const bk30 = await models.phone_tinder_matches.findAll({
                        where: { phone_number_1: phone_number }
                    });
                    addToBackup(bk30[0], "phone_tinder_matches");
                    await models.phone_tinder_matches.destroy({
                        where: { phone_number_1: phone_number }
                    });
                    addLog(`Deleted records from phone_tinder_matches for phone_number_1: ${phone_number}`);

                    // phone_tinder_matches, phone_number_2
                    const bk31 = await models.phone_tinder_matches.findAll({
                        where: { phone_number_2: phone_number }
                    });
                    addToBackup(bk31[0], "phone_tinder_matches");
                    await models.phone_tinder_matches.destroy({
                        where: { phone_number_2: phone_number }
                    });
                    addLog(`Deleted records from phone_tinder_matches for phone_number_2: ${phone_number}`);

                    // phone_tinder_messages, sender
                    const bk32 = await models.phone_tinder_messages.findAll({
                        where: { sender: phone_number }
                    });
                    addToBackup(bk32[0], "phone_tinder_messages");
                    await models.phone_tinder_messages.destroy({
                        where: { sender: phone_number }
                    });
                    addLog(`Deleted records from phone_tinder_messages for sender: ${phone_number}`);

                    // phone_tinder_messages, recipient
                    const bk33 = await models.phone_tinder_messages.findAll({
                        where: { recipient: phone_number }
                    });
                    addToBackup(bk33[0], "phone_tinder_messages");
                    await models.phone_tinder_messages.destroy({
                        where: { recipient: phone_number }
                    });
                    addLog(`Deleted records from phone_tinder_messages for recipient: ${phone_number}`);

                    // phone_tinder_swipes, swiper
                    const bk34 = await models.phone_tinder_swipes.findAll({
                        where: { swiper: phone_number }
                    });
                    addToBackup(bk34[0], "phone_tinder_swipes");
                    await models.phone_tinder_swipes.destroy({
                        where: { swiper: phone_number }
                    });
                    addLog(`Deleted records from phone_tinder_swipes for swiper: ${phone_number}`);

                    // phone_tinder_swipes, swipee
                    const bk35 = await models.phone_tinder_swipes.findAll({
                        where: { swipee: phone_number }
                    });
                    addToBackup(bk35[0], "phone_tinder_swipes");
                    await models.phone_tinder_swipes.destroy({
                        where: { swipee: phone_number }
                    });
                    addLog(`Deleted records from phone_tinder_swipes for swipee: ${phone_number}`);

                    // phone_twitter_accounts, phone_number
                    const bk36 = await models.phone_twitter_accounts.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk36[0], "phone_twitter_accounts");
                    await models.phone_twitter_accounts.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_twitter_accounts for phone number: ${phone_number}`);

                    // phone_voice_memos_recordings, phone_number
                    const bk37 = await models.phone_voice_memos_recordings.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk37[0], "phone_voice_memos_recordings");
                    await models.phone_voice_memos_recordings.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_voice_memos_recordings for phone number: ${phone_number}`);

                    // phone_wallet_transactions, phone_number
                    const bk38 = await models.phone_wallet_transactions.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk38[0], "phone_wallet_transactions");
                    await models.phone_wallet_transactions.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_wallet_transactions for phone number: ${phone_number}`);

                    // phone_yellow_pages_posts, phone_number
                    const bk39 = await models.phone_yellow_pages_posts.findAll({
                        where: { phone_number: phone_number }
                    });
                    addToBackup(bk39[0], "phone_yellow_pages_posts");
                    await models.phone_yellow_pages_posts.destroy({
                        where: { phone_number: phone_number }
                    });
                    addLog(`Deleted records from phone_yellow_pages_posts for phone number: ${phone_number}`);
                }

                addToBackup(phoneResults[0], "phone_phones")
            }

            else if (query.column === "keyholders") {
                const keyHoldersResultsCitizenId = await models.player_houses.findAll({ where: { citizenid: license } });
                const keyHoldersResultsOwner = await models.player_houses.findAll({ where: { owner: license } });

                if (keyHoldersResultsCitizenId.length > 0 && keyHoldersResultsOwner.length > 0) {
                    // Fetch the current value of keyholders
                    const house = await models.player_houses.findOne({
                        where: { keyholders: { [Op.contains]: [license] } },
                        attributes: ['keyholders']
                    });

                    if (house && house.keyholders) {
                        // Make a local copy of keyholders
                        let updatedKeyholders = [...house.keyholders];

                        // Remove the license from the array
                        updatedKeyholders = updatedKeyholders.filter(holder => holder !== license);

                        // Re-update the keyholders list in the database
                        const updateResult = await models.player_houses.update(
                            { keyholders: updatedKeyholders },
                            { where: { keyholders: { [Op.contains]: [license] } } }
                        );

                    }
                }
            }

            else if (query.column === "gang_id") {
                const gangResults = await models.gangs.findAll({ where: { identifier: license }, attributes: ['id'] });
                addToBackup(gangResults[0, "gangs"])
                if (gangResults.length > 0) {
                    const gangZone = await models.gang_zones.findAll({ where: { gang_id: gangResults[0].id }, attributes: [query.column] });
                    addToBackup(gangZone[0], "gang_zones")

                    if (gangZone.length > 0) {
                        await models.gang_zones.destroy({ where: { gang_id: gangResults[0].id } });
                        addLog(`Deleted records from gang_zones for gang_id: ${gangResults[0].id}`);
                    }

                    await models.gangs.destroy({ where: { identifier: license } });
                    addLog(`Deleted records from gangs for identifier: ${license} `);
                }
            }

            else {
                const results = await query.model.findAll({
                    where: { [query.column]: license },
                    attributes: [query.column]
                });

                addToBackup(results[0], `${query.tableName}`)
                if (results.length > 0) {
                    await query.model.destroy({ where: { [query.column]: license } });
                    addLog(`Deleted records from ${query.model.name} for ${query.column} = ${license}`);
                } else {
                    addLog(`No results found for ${query.model.name} with ${query.column} = ${license} `);
                }

            }
        }


        if (stateId[0] != undefined && stateId[0] != null) {
            const stateIdentifier = stateId[0].stateid;

            try {
                const stateIdQueries = [
                    { model: models.drx_mdt_bolos, column: 'author', tableName: 'drx_mdt_bolos' },
                    { model: models.drx_mdt_evidence, column: 'author', tableName: 'drx_mdt_evidence' },
                    { model: models.drx_mdt_evidence_link, column: 'identifier', tableName: 'drx_mdt_evidence_link' },
                    { model: models.drx_mdt_incident, column: 'author', tableName: 'drx_mdt_incident' },
                    { model: models.drx_mdt_incident_criminals, column: 'identifier', tableName: 'drx_mdt_incident_criminals' },
                    { model: models.drx_mdt_incident_link, column: 'identifier', tableName: 'drx_mdt_incident_link' },
                    { model: models.drx_mdt_officers, column: 'identifier', tableName: 'drx_mdt_officers' },
                    { model: models.drx_mdt_player_link, column: 'stateid', tableName: 'drx_mdt_player_link' },
                    { model: models.comp_requests, column: 'state_id', tableName: 'comp_requests' },
                    { model: models.drx_mdt_report, column: 'author', tableName: 'drx_mdt_report' },
                    { model: models.drx_mdt_report, column: 'citizens', tableName: 'drx_mdt_report' },
                    { model: models.drx_mdt_report, column: 'officers', tableName: 'drx_mdt_report' },
                    { model: models.drx_mdt_report_link, column: 'identifier', tableName: 'drx_mdt_report_link' },
                    { model: models.drx_mdt_roster, column: 'identifier', tableName: 'drx_mdt_roster' },
                    { model: models.drx_mdt_vehicle_link, column: 'identifier', tableName: 'drx_mdt_vehicle_link' },
                    { model: models.drx_mdt_warrants, column: 'identifier', tableName: 'drx_mdt_warrants' },
                    { model: models.drx_mdt_warrants, column: 'author', tableName: 'drx_mdt_warrants' },
                    { model: models.drx_mdt_weapons, column: 'owner', tableName: 'drx_mdt_weapons' }

                ];

                // Loop through each query configuration and perform the destroy operation for stateId
                for (let query of stateIdQueries) {
                    const stateResults = await query.model.findAll({
                        where: { [query.column]: stateIdentifier },
                        attributes: [query.column]
                    });

                    if (stateResults.length > 0) {


                        await query.model.destroy({ where: { [query.column]: stateIdentifier } });
                        addLog(`Deleted records from ${query.model.name} for ${query.column} = ${stateIdentifier}`);
                    } else {
                        addLog(`No results found for ${query.model.name} with ${query.column} = ${stateIdentifier} `);
                    }

                    addToBackup(stateResults[0], `${query.tableName}`)
                }

                // Convert the simplified data to a JSON string
            } catch (error) {
                console.error('Error executing stateId queries:', error);
            }
        }
    } catch (error) {
        console.error('Error executing queries:', error);
    }




}

module.exports = { deleteMostWantedCharacter, fetchCharactersByLicense };