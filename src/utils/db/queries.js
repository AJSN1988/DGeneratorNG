const queries = {
  getClientsWithSumm: `
    SELECT users_accounts.account_id, users.login, users.full_name, users.actual_address, 
    users.flat_number, users.comments, account_tariff_link.tariff_id, 
    (
      SELECT ROUND(SUM(tel_sessions_detail.sum_cost), 2) * 100 AS total 
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= ? 
      AND tel_sessions_log.session_start_date < ?
    ) AS mg_summ
    FROM users, users_accounts, account_tariff_link 
    WHERE users.id = users_accounts.uid 
    AND users_accounts.account_id = account_tariff_link.account_id 
    AND account_tariff_link.tariff_id = ? 
    AND users.is_deleted = 0 
    AND account_tariff_link.is_deleted = 0;
  `,
  getAllLegalCallStat: `
   SELECT users_accounts.account_id, users.login, users.full_name, users.actual_address, 
    users.flat_number, users.comments AS contract_number, account_tariff_link.tariff_id, 
    @start_period := ?, @end_period := ?, @tax := ?, 
    (
      SELECT IFNULL(CEIL(SUM(tel_sessions_detail.duration) / 60), 0) AS duration  
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id  
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS total_duration, 
    (
      SELECT ROUND(IFNULL(SUM(tel_sessions_detail.sum_cost), 0), 1) 
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 1  
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS zone_summ, 
    (
      SELECT IFNULL(CEIL(SUM(tel_sessions_detail.duration) / 60), 0) AS duration  
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 1 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS zone_duration, 
    (
      SELECT ROUND(IFNULL(SUM(tel_sessions_detail.sum_cost), 0), 1)
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 2 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS mg_summ, 
    (
      SELECT IFNULL(CEIL(SUM(tel_sessions_detail.duration) / 60), 0) AS duration  
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 2 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS mg_duration, 
    (
      SELECT ROUND(IFNULL(SUM(tel_sessions_detail.sum_cost), 0), 1)
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 3 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS mn_summ, 
    (
      SELECT IFNULL(CEIL(SUM(tel_sessions_detail.duration) / 60), 0) AS duration   
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 3 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS mn_duration 
    FROM users, users_accounts, account_tariff_link 
    WHERE users.id = users_accounts.uid 
    AND users_accounts.account_id = account_tariff_link.account_id 
    AND account_tariff_link.tariff_id = ? 
    AND users.is_deleted = 0 
    AND account_tariff_link.is_deleted = 0;
  `,
  getAllCivilCallStat: `
   SELECT users_accounts.account_id, users.login, users.full_name, users.actual_address, 
    users.flat_number, users.comments AS contract_number, account_tariff_link.tariff_id, 
    @start_period := ?, @end_period := ?, @tax := ?, 
    (
      SELECT IFNULL(SUM(tel_sessions_detail.sum_cost) / @tax, 0)  
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period 
      AND tel_sessions_log.session_start_date < @end_period
    ) AS total_summ,   
    (
      SELECT IFNULL(ROUND(SUM(tel_sessions_detail.sum_cost), 2) * 100, 0) 
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period 
      AND tel_sessions_log.session_start_date < @end_period
    ) AS total_summ_with_tax,    
    (
      SELECT IFNULL(CEIL(SUM(tel_sessions_detail.duration) / 60), 0) AS duration  
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id  
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS total_duration, 
    (
      SELECT IFNULL(SUM(tel_sessions_detail.sum_cost) / @tax, 0) 
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 1  
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS zone_summ, 
    (
      SELECT IFNULL(ROUND(SUM(tel_sessions_detail.sum_cost), 2) * 100, 0) 
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 1  
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS zone_summ_with_tax, 
    (
      SELECT IFNULL(CEIL(SUM(tel_sessions_detail.duration) / 60), 0) AS duration  
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 1 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS zone_duration, 
    (
      SELECT IFNULL(SUM(tel_sessions_detail.sum_cost) / @tax, 0) 
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 2 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS mg_summ, 
    (
      SELECT IFNULL(ROUND(SUM(tel_sessions_detail.sum_cost), 2) * 100, 0) 
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 2 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS mg_summ_with_tax, 
    (
      SELECT CEIL(SUM(tel_sessions_detail.duration) / 60) AS duration  
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 2 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS mg_duration, 
    (
      SELECT IFNULL(SUM(tel_sessions_detail.sum_cost) / @tax, 0) 
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 3 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS mn_summ, 
    (
      SELECT IFNULL(ROUND(SUM(tel_sessions_detail.sum_cost), 2) * 100, 0) 
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 3 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS mn_summ_with_tax,
    (
      SELECT CEIL(SUM(tel_sessions_detail.duration) / 60) AS duration  
      FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
      WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
      AND tel_sessions_log.account_id = users_accounts.account_id 
      AND tel_zones_v2.zone_type = 3 
      AND tel_sessions_log.zone_id = tel_zones_v2.id 
      AND tel_sessions_log.session_start_date >= @start_period  
      AND tel_sessions_log.session_start_date < @end_period 
    ) AS mn_duration 
    FROM users, users_accounts, account_tariff_link 
    WHERE users.id = users_accounts.uid 
    AND users_accounts.account_id = account_tariff_link.account_id 
    AND account_tariff_link.tariff_id = ? 
    AND users.is_deleted = 0 
    AND account_tariff_link.is_deleted = 0;
  `,
  getClientMgSumm: `
    SELECT ROUND(SUM(tel_sessions_detail.sum_cost), 2) * 100 AS total  
    FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
    WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
    AND tel_sessions_log.account_id = ? 
    AND tel_sessions_log.zone_id = tel_zones_v2.id 
    AND tel_sessions_log.session_start_date >= ? 
    AND tel_sessions_log.session_start_date < ?;
  `,
  getMgMnCalls: `SELECT tel_sessions_log.Calling_Station_Id AS numberA, 
    tel_sessions_log.Called_Station_Id AS numberB, 
    tel_zones_v2.name AS name,
    tel_zones_v2.zone_type as zoneType,  
    tel_sessions_log.session_start_date AS date, 
    tel_sessions_detail.duration AS duration, 
    ROUND(tel_sessions_detail.base_cost, 3) * 1000 AS tarifCost, 
    ROUND(tel_sessions_detail.sum_cost, 3) * 1000 AS summ
    FROM tel_sessions_log, tel_sessions_detail, tel_zones_v2 
    WHERE tel_sessions_log.id = tel_sessions_detail.dhs_sess_id 
    AND tel_sessions_log.account_id = ? 
    AND tel_sessions_log.zone_id = tel_zones_v2.id 
    AND tel_sessions_log.session_start_date >= ? 
    AND tel_sessions_log.session_start_date < ?;
  `,
};

export default queries;