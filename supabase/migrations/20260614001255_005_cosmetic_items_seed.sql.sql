-- Insert default cosmetic items
INSERT INTO cosmetic_items (id, name, type, rarity, price, premium_only, data) VALUES
-- Hair styles
('hair-short', 'Short Hair', 'hair', 'common', 0, false, '{"colors": ["#4a3728", "#1a1a1f", "#d4a574", "#c44536", "#5e7a6b"]}'),
('hair-long', 'Long Hair', 'hair', 'common', 50, false, '{"colors": ["#4a3728", "#1a1a1f", "#d4a574", "#c44536", "#5e7a6b"]}'),
('hair-curly', 'Curly Hair', 'hair', 'rare', 100, false, '{"colors": ["#4a3728", "#1a1a1f", "#d4a574", "#c44536", "#5e7a6b"]}'),
('hair-spiky', 'Spiky Hair', 'hair', 'rare', 100, false, '{"colors": ["#4a3728", "#1a1a1f", "#d4a574", "#c44536", "#5e7a6b"]}'),
('hair-mohawk', 'Mohawk', 'hair', 'legendary', 0, true, '{"colors": ["#ff6b6b", "#4ecdc4", "#ffe66d", "#95e1d3"]}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cosmetic_items (id, name, type, rarity, price, premium_only, data) VALUES
-- Eyes
('eyes-normal', 'Normal Eyes', 'eyes', 'common', 0, false, '{"colors": ["#3d5a80", "#2d6a4f", "#6b2737", "#1a1a1f"]}'),
('eyes-round', 'Round Eyes', 'eyes', 'common', 30, false, '{"colors": ["#3d5a80", "#2d6a4f", "#6b2737", "#1a1a1f"]}'),
('eyes-sharp', 'Sharp Eyes', 'eyes', 'rare', 80, false, '{"colors": ["#3d5a80", "#2d6a4f", "#6b2737", "#1a1a1f"]}'),
('eyes-glowing', 'Glowing Eyes', 'eyes', 'legendary', 0, true, '{"colors": ["#00ff88", "#ff00ff", "#00ffff"]}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cosmetic_items (id, name, type, rarity, price, premium_only, data) VALUES
-- Outfits
('outfit-casual', 'Casual Outfit', 'outfit', 'common', 0, false, '{"colors": ["#5e7a6b", "#3d5a80", "#6b2737", "#4a3728"]}'),
('outfit-hoodie', 'Hoodie', 'outfit', 'common', 60, false, '{"colors": ["#1a1a1f", "#3d5a80", "#6b2737", "#2d6a4f"]}'),
('outfit-formal', 'Formal Suit', 'outfit', 'rare', 150, false, '{"colors": ["#1a1a1f", "#2d3748", "#744210"]}'),
('outfit-armor', 'Hero Armor', 'outfit', 'legendary', 0, true, '{"colors": ["#ffd700", "#c0c0c0", "#cd7f32"]}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cosmetic_items (id, name, type, rarity, price, premium_only, data) VALUES
-- Accessories
('acc-none', 'No Accessory', 'accessory', 'common', 0, false, '{"colors": []}'),
('acc-glasses', 'Glasses', 'accessory', 'common', 40, false, '{"colors": ["#1a1a1f", "#d4a574"]}'),
('acc-sunglasses', 'Sunglasses', 'accessory', 'rare', 90, false, '{"colors": ["#1a1a1f", "#d4a574"]}'),
('acc-headphones', 'Headphones', 'accessory', 'rare', 120, false, '{"colors": ["#1a1a1f", "#3d5a80", "#ff6b6b"]}'),
('acc-crown', 'Crown', 'accessory', 'legendary', 0, true, '{"colors": ["#ffd700"]}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cosmetic_items (id, name, type, rarity, price, premium_only, data) VALUES
-- Backgrounds
('bg-none', 'No Background', 'background', 'common', 0, false, '{"style": "none"}'),
('bg-sunset', 'Sunset', 'background', 'common', 75, false, '{"style": "sunset"}'),
('bg-night', 'Night Sky', 'background', 'rare', 150, false, '{"style": "night"}'),
('bg-forest', 'Forest', 'background', 'rare', 150, false, '{"style": "forest"}'),
('bg-cosmic', 'Cosmic', 'background', 'legendary', 0, true, '{"style": "cosmic"}')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cosmetic_items (id, name, type, rarity, price, premium_only, data) VALUES
-- Titles
('title-none', '', 'title', 'common', 0, false, '{}'),
('title-seeker', 'The Seeker', 'title', 'common', 100, false, '{}'),
('title-habit-master', 'Habit Master', 'title', 'rare', 300, false, '{}'),
('title-pet-whisperer', 'Pet Whisperer', 'title', 'rare', 300, false, '{}'),
('title-legend', 'Living Legend', 'title', 'legendary', 0, true, '{}')
ON CONFLICT (id) DO NOTHING;