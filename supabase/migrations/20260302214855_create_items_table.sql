/*
  # Création de la table items pour SmartManager

  1. Nouvelles tables
    - `items`
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence à auth.users)
      - `name` (text, nom de l'élément)
      - `description` (text, description)
      - `category` (text, catégorie)
      - `status` (text, statut actif/inactif)
      - `price` (numeric, prix)
      - `quantity` (integer, quantité)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sécurité
    - Active RLS sur la table `items`
    - Politique permettant aux utilisateurs de lire leurs propres éléments
    - Politique permettant aux utilisateurs de créer leurs propres éléments
    - Politique permettant aux utilisateurs de modifier leurs propres éléments
    - Politique permettant aux utilisateurs de supprimer leurs propres éléments
*/

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  category text DEFAULT 'Général',
  status text DEFAULT 'actif',
  price numeric DEFAULT 0,
  quantity integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent lire leurs propres éléments"
  ON items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres éléments"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres éléments"
  ON items
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres éléments"
  ON items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS items_user_id_idx ON items(user_id);
CREATE INDEX IF NOT EXISTS items_status_idx ON items(status);