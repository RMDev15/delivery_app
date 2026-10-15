-- Schema SQL para Supabase - Projeto Delivery
CREATE TABLE IF NOT EXISTS "public"."Usuario" (
  "ID" BIGSERIAL PRIMARY KEY,
  "Nome" VARCHAR(255) NOT NULL,
  "Email" VARCHAR(255) UNIQUE NOT NULL,
  "Tipo_Acesso" VARCHAR(50) DEFAULT 'Comum',
  "Data_Cadastro" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "public"."Restaurante" (
  "ID" BIGSERIAL PRIMARY KEY,
  "Nome" VARCHAR(255) NOT NULL,
  "Imagem" TEXT
);

CREATE TABLE IF NOT EXISTS "public"."Comida" (
  "ID" BIGSERIAL PRIMARY KEY,
  "Nome" VARCHAR(255) NOT NULL,
  "Preco" NUMERIC(10, 2) NOT NULL,
  "Rating" NUMERIC(3, 1),
  "Imagem" TEXT
);
