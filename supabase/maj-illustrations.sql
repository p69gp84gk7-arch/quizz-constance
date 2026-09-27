-- Illustrations libres (Wikimedia Commons) ajoutées aux questions existantes.
--
-- Les photos montrent le SUJET de la question, jamais sa réponse : aucune question
-- n'est offerte. Le crédit de l'auteur s'affiche en petit sous la photo, comme les
-- licences le demandent.
-- À coller dans Supabase → SQL Editor → Run. Sans risque si déjà passé.

alter table questions add column if not exists media_credit text;

-- tour Eiffel → Sous la Tour Eiffel 1.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bd/Sous_la_Tour_Eiffel_1.jpg/1280px-Sous_la_Tour_Eiffel_1.jpg', media_credit = 'Jebulon · CC0' where id in ('Q0233', 'Q0761', 'Q0776', 'Q0788');
-- Joconde → Leonardo di ser Piero da Vinci - Portrait de Mona Lisa (dite La Joconde) - Louvre 779 - Detail (hands).jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/6/64/Leonardo_di_ser_Piero_da_Vinci_-_Portrait_de_Mona_Lisa_%28dite_La_Joconde%29_-_Louvre_779_-_Detail_%28hands%29.jpg', media_credit = 'Leonardo da Vinci · Public domain' where id in ('Q0223', 'Q0225', 'Q0767', 'Q0781');
-- Notre-Dame → Vitrail Notre-Dame de Paris 191208 04 Fuite en Egypte.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Vitrail_Notre-Dame_de_Paris_191208_04_Fuite_en_Egypte.jpg/1280px-Vitrail_Notre-Dame_de_Paris_191208_04_Fuite_en_Egypte.jpg', media_credit = 'Vassil · Public domain' where id in ('Q0792');
-- Versailles → Gezicht op het Château de Versailles Palais de Versailles, Facade Principale (titel op object), RP-F-F19777.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Gezicht_op_het_Ch%C3%A2teau_de_Versailles_Palais_de_Versailles%2C_Facade_Principale_%28titel_op_object%29%2C_RP-F-F19777.jpg/1280px-Gezicht_op_het_Ch%C3%A2teau_de_Versailles_Palais_de_Versailles%2C_Facade_Principale_%28titel_op_object%29%2C_RP-F-F19777.jpg', media_credit = 'Rijksmuseum · CC0' where id in ('Q0635');
-- tour de Pise → Cathedral and Campanary - Pisa 2014 (2).JPG
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Cathedral_and_Campanary_-_Pisa_2014_%282%29.JPG/1280px-Cathedral_and_Campanary_-_Pisa_2014_%282%29.JPG', media_credit = 'José Luiz · CC BY-SA 3.0' where id in ('Q0036');
-- Sagrada Família → Detalle da Sagrada Familia. Barcelona B16.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Detalle_da_Sagrada_Familia._Barcelona_B16.jpg/1280px-Detalle_da_Sagrada_Familia._Barcelona_B16.jpg', media_credit = 'Luis Miguel Bugallo Sánchez (Lmbuga) · CC BY-SA 3.0' where id in ('Q0477');
-- Nil → ISS035-E-007148 Nile - Sinai - Dead Sea - Wide Angle View.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/af/ISS035-E-007148_Nile_-_Sinai_-_Dead_Sea_-_Wide_Angle_View.jpg/1280px-ISS035-E-007148_Nile_-_Sinai_-_Dead_Sea_-_Wide_Angle_View.jpg', media_credit = 'Expedition 35 Crew Image courtesy of the NASA Johnson Space  · Public domain' where id in ('Q0505');
-- loup → Scandinavian grey wolf Canis lupus.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Scandinavian_grey_wolf_Canis_lupus.jpg/1280px-Scandinavian_grey_wolf_Canis_lupus.jpg', media_credit = 'Malene Thyssen · CC BY-SA 3.0' where id in ('Q0470');
-- guépard → Cheetah Run.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Cheetah_Run.jpg/1280px-Cheetah_Run.jpg', media_credit = 'Mark Dumont · CC BY 2.0' where id in ('Q0114');
-- Lune → Full moon partially obscured by atmosphere.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Full_moon_partially_obscured_by_atmosphere.jpg/1280px-Full_moon_partially_obscured_by_atmosphere.jpg', media_credit = 'NASA · Public domain' where id in ('Q0006', 'Q0090', 'Q0323', 'Q0366', 'Q0380', 'Q0692', 'Q0744');
-- Cène → Leonardo da Vinci (1452-1519) - The Last Supper (1495-1498).jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Leonardo_da_Vinci_%281452-1519%29_-_The_Last_Supper_%281495-1498%29.jpg/1280px-Leonardo_da_Vinci_%281452-1519%29_-_The_Last_Supper_%281495-1498%29.jpg', media_credit = 'Leonardo da Vinci · Public domain' where id in ('Q0460');
-- Penseur → The Thinker, Musée Rodin, Paris September 2013 003.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/The_Thinker%2C_Mus%C3%A9e_Rodin%2C_Paris_September_2013_003.jpg/1280px-The_Thinker%2C_Mus%C3%A9e_Rodin%2C_Paris_September_2013_003.jpg', media_credit = 'Tammy Lo from New York, NY · CC BY 2.0' where id in ('Q0239');
-- Guernica → "Guernica" by Picasso at MOMA, NYC.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/%22Guernica%22_by_Picasso_at_MOMA%2C_NYC.jpg/1280px-%22Guernica%22_by_Picasso_at_MOMA%2C_NYC.jpg', media_credit = 'Gotfryd, Bernard · Public domain' where id in ('Q0238');

select count(*) as questions_illustrees from questions where media_url <> '' and media_url is not null;
