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
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/6/64/Leonardo_di_ser_Piero_da_Vinci_-_Portrait_de_Mona_Lisa_%28dite_La_Joconde%29_-_Louvre_779_-_Detail_%28hands%29.jpg', media_credit = 'Leonardo da Vinci · Public domain' where id in ('Q0223', 'Q0767', 'Q0781');
-- Louvre → View of the Louvre Palace from inside of the Louvre Pyramid 004.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/View_of_the_Louvre_Palace_from_inside_of_the_Louvre_Pyramid_004.jpg/1280px-View_of_the_Louvre_Palace_from_inside_of_the_Louvre_Pyramid_004.jpg', media_credit = 'Janericloebe · Public domain' where id in ('Q0244', 'Q0252', 'Q0710', 'Q0809');
-- Notre-Dame → Cathedral Notre Dame de Paris (27702089304).jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Cathedral_Notre_Dame_de_Paris_%2827702089304%29.jpg/1280px-Cathedral_Notre_Dame_de_Paris_%2827702089304%29.jpg', media_credit = 'Gary Todd from Xinzheng, China · CC0' where id in ('Q0792');
-- Versailles → Palace of Versailles, Detail (2).jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Palace_of_Versailles%2C_Detail_%282%29.jpg/1280px-Palace_of_Versailles%2C_Detail_%282%29.jpg', media_credit = 'Julian Lupyan · Public domain' where id in ('Q0635');
-- tour de Pise → Cathedral and Campanary - Pisa 2014 (2).JPG
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Cathedral_and_Campanary_-_Pisa_2014_%282%29.JPG/1280px-Cathedral_and_Campanary_-_Pisa_2014_%282%29.JPG', media_credit = 'José Luiz · CC BY-SA 3.0' where id in ('Q0036');
-- Statue de la Liberté → Statue of Liberty, NY.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d3/Statue_of_Liberty%2C_NY.jpg/1280px-Statue_of_Liberty%2C_NY.jpg', media_credit = 'William Warby · CC BY 2.0' where id in ('Q0762');
-- Grande Muraille → Great Wall of China July 2006.JPG
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Great_Wall_of_China_July_2006.JPG/1280px-Great_Wall_of_China_July_2006.JPG', media_credit = 'Velatrix · CC0' where id in ('Q0744');
-- Machu Picchu → Machu Picchu.png
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Machu_Picchu.png/1280px-Machu_Picchu.png', media_credit = 'Hiram Bingham III · Public domain' where id in ('Q0347');
-- pyramides → Pyramids in Giza - Egypt.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Pyramids_in_Giza_-_Egypt.jpg/1280px-Pyramids_in_Giza_-_Egypt.jpg', media_credit = 'Walkerssk · CC0' where id in ('Q0004', 'Q0755');
-- Sagrada Família → Detalle da Sagrada Familia. Barcelona B16.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Detalle_da_Sagrada_Familia._Barcelona_B16.jpg/1280px-Detalle_da_Sagrada_Familia._Barcelona_B16.jpg', media_credit = 'Luis Miguel Bugallo Sánchez (Lmbuga) · CC BY-SA 3.0' where id in ('Q0477');
-- Marseille → Vieux-Port Marseille.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Vieux-Port_Marseille.jpg/1280px-Vieux-Port_Marseille.jpg', media_credit = 'DanielMichaelPerry · CC0' where id in ('Q0271', 'Q0644');
-- Londres → Tower Bridge London Feb 2006.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Tower_Bridge_London_Feb_2006.jpg/1280px-Tower_Bridge_London_Feb_2006.jpg', media_credit = 'Diliff · CC BY-SA 3.0' where id in ('Q0042', 'Q0531');
-- Berlin → Berlin, Brandenburger Tor -- 2008 -- 0153.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Berlin%2C_Brandenburger_Tor_--_2008_--_0153.jpg/1280px-Berlin%2C_Brandenburger_Tor_--_2008_--_0153.jpg', media_credit = 'Dietmar Rabich · CC BY-SA 4.0' where id in ('Q0532', 'Q0623');
-- Istanbul → Istanbul Hagia Sophia IMG 7346 1725.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/Istanbul_Hagia_Sophia_IMG_7346_1725.jpg/1280px-Istanbul_Hagia_Sophia_IMG_7346_1725.jpg', media_credit = 'Alexxx1979 · CC BY-SA 3.0' where id in ('Q0055');
-- Everest → Everest Summit.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Everest_Summit.jpg/1280px-Everest_Summit.jpg', media_credit = 'Alfonso.mnr · CC0' where id in ('Q0339');
-- Mont Blanc → View of Megève and the Mont Blanc massif from Le Christomet, Megève, 2025.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/View_of_Meg%C3%A8ve_and_the_Mont_Blanc_massif_from_Le_Christomet%2C_Meg%C3%A8ve%2C_2025.jpg/1280px-View_of_Meg%C3%A8ve_and_the_Mont_Blanc_massif_from_Le_Christomet%2C_Meg%C3%A8ve%2C_2025.jpg', media_credit = 'DimiTalen · CC0' where id in ('Q0046');
-- Sahara → ISS-64 Sahara Desert, Murzuq District in central Libya.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/ISS-64_Sahara_Desert%2C_Murzuq_District_in_central_Libya.jpg/1280px-ISS-64_Sahara_Desert%2C_Murzuq_District_in_central_Libya.jpg', media_credit = 'NASA · Public domain' where id in ('Q0041', 'Q0775');
-- Antarctique → Antarctica(js) 33.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Antarctica%28js%29_33.jpg/1280px-Antarctica%28js%29_33.jpg', media_credit = 'Jerzy Strzelecki · CC BY-SA 3.0' where id in ('Q0583');
-- éléphant → African bush elephant (Loxodonta africana), Masai Mara.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/African_bush_elephant_%28Loxodonta_africana%29%2C_Masai_Mara.jpg/1280px-African_bush_elephant_%28Loxodonta_africana%29%2C_Masai_Mara.jpg', media_credit = 'Hobbyfotowiki · CC0' where id in ('Q0397');
-- girafe → Rothschild's Giraffe Image10.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/Rothschild%27s_Giraffe_Image10.jpg/1280px-Rothschild%27s_Giraffe_Image10.jpg', media_credit = 'Timothy Akolamazima · CC BY-SA 4.0' where id in ('Q0118', 'Q0402', 'Q0750');
-- manchot → PENGUIN LIFECYCLE H.JPG
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/PENGUIN_LIFECYCLE_H.JPG/1280px-PENGUIN_LIFECYCLE_H.JPG', media_credit = 'Zina Deretsky , National Science Foundation · Public domain' where id in ('Q0390');
-- pieuvre → Octopus marginatus.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Octopus_marginatus.jpg/1280px-Octopus_marginatus.jpg', media_credit = 'Nhobgood Nick Hobgood · CC BY-SA 3.0' where id in ('Q0101');
-- abeille → Apis dorsata Honey Bee feeding on Nectar of Strobilanthus.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bf/Apis_dorsata_Honey_Bee_feeding_on_Nectar_of_Strobilanthus.jpg/1280px-Apis_dorsata_Honey_Bee_feeding_on_Nectar_of_Strobilanthus.jpg', media_credit = 'Nikhilmore · CC BY-SA 4.0' where id in ('Q0108', 'Q0121', 'Q0624');
-- baleine → HumpbackWhaleBreaching.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/HumpbackWhaleBreaching.jpg/1280px-HumpbackWhaleBreaching.jpg', media_credit = 'Wanetta Ayers · Public domain' where id in ('Q0096');
-- requin → Great White Shark (Carcharodon carcharias).jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Great_White_Shark_%28Carcharodon_carcharias%29.jpg/1280px-Great_White_Shark_%28Carcharodon_carcharias%29.jpg', media_credit = 'Godot13 · CC BY-SA 4.0' where id in ('Q0115');
-- koala → Koala at Otway National Park.JPG
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Koala_at_Otway_National_Park.JPG/1280px-Koala_at_Otway_National_Park.JPG', media_credit = 'Cycling · CC BY-SA 3.0' where id in ('Q0120', 'Q0577');
-- panda → Giant Female Panda Mei Xiang Munching Bamboo -- Female Panda at the National Zoo NW Washington (DC) November 2017.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/ff/Giant_Female_Panda_Mei_Xiang_Munching_Bamboo_--_Female_Panda_at_the_National_Zoo_NW_Washington_%28DC%29_November_2017.jpg/1280px-Giant_Female_Panda_Mei_Xiang_Munching_Bamboo_--_Female_Panda_at_the_National_Zoo_NW_Washington_%28DC%29_November_2017.jpg', media_credit = 'Ron Cogswell · CC BY 2.0' where id in ('Q0102');
-- loup → Scandinavian grey wolf Canis lupus.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Scandinavian_grey_wolf_Canis_lupus.jpg/1280px-Scandinavian_grey_wolf_Canis_lupus.jpg', media_credit = 'Malene Thyssen · CC BY-SA 3.0' where id in ('Q0470');
-- guépard → Cheetah Run.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Cheetah_Run.jpg/1280px-Cheetah_Run.jpg', media_credit = 'Mark Dumont · CC BY 2.0' where id in ('Q0114');
-- dauphin → Common Bottlenose Dolphin (Tursiops truncatus) Catalina swimming in front of boat.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Common_Bottlenose_Dolphin_%28Tursiops_truncatus%29_Catalina_swimming_in_front_of_boat.jpg/1280px-Common_Bottlenose_Dolphin_%28Tursiops_truncatus%29_Catalina_swimming_in_front_of_boat.jpg', media_credit = 'Kiloueka · CC0' where id in ('Q0103');
-- Lune → Full moon partially obscured by atmosphere.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/Full_moon_partially_obscured_by_atmosphere.jpg/1280px-Full_moon_partially_obscured_by_atmosphere.jpg', media_credit = 'NASA · Public domain' where id in ('Q0006', 'Q0090', 'Q0323', 'Q0366', 'Q0380');
-- Mars → Hubble Globes of Mars.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Hubble_Globes_of_Mars.jpg/1280px-Hubble_Globes_of_Mars.jpg', media_credit = 'David Crisp and the WFPC2 Science Team (Jet Propulsion Labor · Public domain' where id in ('Q0561');
-- Jupiter → PLANET JUPITER.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/PLANET_JUPITER.jpg/1280px-PLANET_JUPITER.jpg', media_credit = 'Lapos71 · CC BY-SA 4.0' where id in ('Q0692');
-- Soleil → Largest Solar Flare Since 2017 Spotted on the Sun (NESDIS 2020-06-05).png
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Largest_Solar_Flare_Since_2017_Spotted_on_the_Sun_%28NESDIS_2020-06-05%29.png/1280px-Largest_Solar_Flare_Since_2017_Spotted_on_the_Sun_%28NESDIS_2020-06-05%29.png', media_credit = 'NOAA · Public domain' where id in ('Q0002', 'Q0063', 'Q0065', 'Q0074', 'Q0084', 'Q0373', 'Q0381');
-- Voie lactée → Milky Way Night Sky (Unsplash).jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Milky_Way_Night_Sky_%28Unsplash%29.jpg/1280px-Milky_Way_Night_Sky_%28Unsplash%29.jpg', media_credit = 'Guillaume guillaume · CC0' where id in ('Q0092');
-- ADN → DNA Helix CPK.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/DNA_Helix_CPK.jpg/1280px-DNA_Helix_CPK.jpg', media_credit = 'Ude · Public domain' where id in ('Q0080', 'Q0564');
-- cerveau → Human brain left midsagitttal view closeup description 2.JPG
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/3/35/Human_brain_left_midsagitttal_view_closeup_description_2.JPG', media_credit = 'John A Beal, PhD Dep''t. of Cellular Biology &amp; Anatomy, L · CC BY 2.5' where id in ('Q0739');
-- volcan → 001 Volcano eruption of Litli-Hrútur in Iceland in 2023 Photo by Giles Laurent.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/001_Volcano_eruption_of_Litli-Hr%C3%BAtur_in_Iceland_in_2023_Photo_by_Giles_Laurent.jpg/1280px-001_Volcano_eruption_of_Litli-Hr%C3%BAtur_in_Iceland_in_2023_Photo_by_Giles_Laurent.jpg', media_credit = 'Giles Laurent · CC BY-SA 4.0' where id in ('Q0528');
-- Picasso → Modigliani, Picasso and André Salmon.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Modigliani%2C_Picasso_and_Andr%C3%A9_Salmon.jpg/1280px-Modigliani%2C_Picasso_and_Andr%C3%A9_Salmon.jpg', media_credit = 'Jean Cocteau · Public domain' where id in ('Q0712');
-- Monet → Claude Monet, Impression, soleil levant.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/Claude_Monet%2C_Impression%2C_soleil_levant.jpg/1280px-Claude_Monet%2C_Impression%2C_soleil_levant.jpg', media_credit = 'Claude Monet · Public domain' where id in ('Q0247');
-- Penseur → The Thinker, Musée Rodin, Paris September 2013 003.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/The_Thinker%2C_Mus%C3%A9e_Rodin%2C_Paris_September_2013_003.jpg/1280px-The_Thinker%2C_Mus%C3%A9e_Rodin%2C_Paris_September_2013_003.jpg', media_credit = 'Tammy Lo from New York, NY · CC BY 2.0' where id in ('Q0239');
-- Guernica → "Guernica" by Picasso at MOMA, NYC.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/%22Guernica%22_by_Picasso_at_MOMA%2C_NYC.jpg/1280px-%22Guernica%22_by_Picasso_at_MOMA%2C_NYC.jpg', media_credit = 'Gotfryd, Bernard · Public domain' where id in ('Q0238');
-- fromage → Fromages français (19387655209).jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Fromages_fran%C3%A7ais_%2819387655209%29.jpg/1280px-Fromages_fran%C3%A7ais_%2819387655209%29.jpg', media_credit = 'Junichi Asakura ( fas ) · CC0' where id in ('Q0256', 'Q0282', 'Q0492', 'Q0493', 'Q0501', 'Q0660');
-- champagne → Flessen champagne en glazen, opdracht Elsevier, Bestanddeelnr 924-1249.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Flessen_champagne_en_glazen%2C_opdracht_Elsevier%2C_Bestanddeelnr_924-1249.jpg/1280px-Flessen_champagne_en_glazen%2C_opdracht_Elsevier%2C_Bestanddeelnr_924-1249.jpg', media_credit = 'Rob Croes for Anefo · CC0' where id in ('Q0279');
-- pizza → Pizza Margherita (14565452088).jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Pizza_Margherita_%2814565452088%29.jpg/1280px-Pizza_Margherita_%2814565452088%29.jpg', media_credit = 'jeffreyw · CC BY 2.0' where id in ('Q0261');
-- paella → Paella de fruit de mer.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Paella_de_fruit_de_mer.jpg/1280px-Paella_de_fruit_de_mer.jpg', media_credit = 'Wilfredor · CC0' where id in ('Q0491');
-- baguette → Baguette and Ciabatta (4202803060).jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Baguette_and_Ciabatta_%284202803060%29.jpg/1280px-Baguette_and_Ciabatta_%284202803060%29.jpg', media_credit = 'Arnold Gatilao from Oakland, CA, USA · CC BY 2.0' where id in ('Q0270', 'Q0720');
-- chocolat → Cooking chocolate with packaging.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Cooking_chocolate_with_packaging.jpg/1280px-Cooking_chocolate_with_packaging.jpg', media_credit = 'SKopp · CC BY-SA 3.0' where id in ('Q0488');
-- Tour de France → Tour de France 2021 Étape 10 à Chambéry - Peloton (1).JPG
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Tour_de_France_2021_%C3%89tape_10_%C3%A0_Chamb%C3%A9ry_-_Peloton_%281%29.JPG/1280px-Tour_de_France_2021_%C3%89tape_10_%C3%A0_Chamb%C3%A9ry_-_Peloton_%281%29.JPG', media_credit = 'Florian Pépellin · CC BY-SA 4.0' where id in ('Q0193', 'Q0206', 'Q0216', 'Q0619', 'Q0696', 'Q0814');
-- Roland-Garros → Rafael Nadal 2011 Roland Garros 2011.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Rafael_Nadal_2011_Roland_Garros_2011.jpg/1280px-Rafael_Nadal_2011_Roland_Garros_2011.jpg', media_credit = 'y.caradec · CC BY-SA 2.0' where id in ('Q0218', 'Q0697', 'Q0813');
-- Wimbledon → Centre Court Wimbledon (2).jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Centre_Court_Wimbledon_%282%29.jpg/1280px-Centre_Court_Wimbledon_%282%29.jpg', media_credit = 'Spiralz from England · CC BY 2.0' where id in ('Q0411', 'Q0618', 'Q0628');
-- Jeux olympiques → Helsinki Olympic Stadion rings.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Helsinki_Olympic_Stadion_rings.jpg/1280px-Helsinki_Olympic_Stadion_rings.jpg', media_credit = 'Erwin Merker · CC BY 2.5' where id in ('Q0192', 'Q0201', 'Q0212', 'Q0214', 'Q0694', 'Q0831', 'Q0832', 'Q0835');
-- marathon → Runners ready to start in Shrubb-Dorando Marathon Race (St. Yves, Longboat, Hayes, and Maloney) LCCN2014683241.jpg
update questions set media_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Runners_ready_to_start_in_Shrubb-Dorando_Marathon_Race_%28St._Yves%2C_Longboat%2C_Hayes%2C_and_Maloney%29_LCCN2014683241.jpg/1280px-Runners_ready_to_start_in_Shrubb-Dorando_Marathon_Race_%28St._Yves%2C_Longboat%2C_Hayes%2C_and_Maloney%29_LCCN2014683241.jpg', media_credit = 'Bain News Service, publisher · Public domain' where id in ('Q0198', 'Q0417', 'Q0629');

select count(*) as questions_illustrees from questions where media_url <> '' and media_url is not null;
