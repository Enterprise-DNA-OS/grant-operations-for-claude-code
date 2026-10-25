insert into organisations(id,name,jurisdiction,balance_date) values ('10000000-0000-0000-0000-000000000001','Harbour Community Trust (fictional)','NZ',(date_trunc('month',current_date)-interval '7 months'-interval '1 day')::date) on conflict do nothing;
insert into grants(id,name,project,funder,owner,currency,status,requested_cents,awarded_cents,deadline,start_date,end_date,restrictions,agreement_ref) values
 ('20000000-0000-0000-0000-000000000001','Community Meals 2026','Food access','Harbour Community Fund','Mere','NZD','awarded',5000000,4000000,current_date-100,current_date-90,current_date+20,'Food and delivery only; report outcomes at close','agreements/meals-2026.pdf'),
 ('20000000-0000-0000-0000-000000000002','Youth Digital Access','Youth services','Coastal Giving Trust','','NZD','preparing',2500000,null,current_date-3,null,null,'',''),
 ('20000000-0000-0000-0000-000000000003','Community Transport','Access','Southern Fund','Aroha','AUD','awarded',3000000,3000000,current_date-180,current_date-150,current_date-5,'Transport services only',''),
 ('20000000-0000-0000-0000-000000000004','Community Meals 2027','Food access','Harbour Community Fund','Mere','NZD','submitted',5000000,null,current_date+60,null,null,'','') on conflict do nothing;
insert into budgets(id,grant_id,category,amount_cents) values
 ('30000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Food',3000000),
 ('30000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Delivery',1000000),
 ('30000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000003','Transport',3000000) on conflict do nothing;
insert into expenses(id,grant_id,reference,category,spent_on,amount_cents,state,evidence_ref,description) values
 ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','MEALS-001','Food',current_date-15,1800000,'actual','receipts/food-001.pdf','Food boxes'),
 ('40000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','MEALS-002','Food',current_date+5,1500000,'planned','','Next food order'),
 ('40000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000001','MEALS-003','Delivery',current_date-10,300000,'actual','','Local delivery'),
 ('40000000-0000-0000-0000-000000000004','20000000-0000-0000-0000-000000000003','BUS-001','Transport',current_date-1,3200000,'actual','receipts/bus.pdf','Transport invoice') on conflict do nothing;
insert into tasks(id,grant_id,title,kind,due_on,owner,requirement_ref) values
 ('50000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','Quarterly outcomes report','report',current_date-2,'Mere','agreements/meals-2026.pdf#reporting'),
 ('50000000-0000-0000-0000-000000000002','20000000-0000-0000-0000-000000000001','Record meals delivered','deliverable',current_date+10,'Mere','agreements/meals-2026.pdf#outcomes'),
 ('50000000-0000-0000-0000-000000000003','20000000-0000-0000-0000-000000000002','Application review','application',current_date-1,'','') on conflict do nothing;
