CREATE DATABASE IF NOT EXISTS wijutopia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE wijutopia_db;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('empleado', 'cliente') DEFAULT 'cliente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    image_url VARCHAR(500) NULL,
    category VARCHAR(120) DEFAULT 'TCG',
    marketplace_tag ENUM('TCGPlayer', 'Cardmarket', 'TradingCardMint', 'Local Wijutopia') DEFAULT 'Local Wijutopia',
    release_status ENUM('catalogo', 'lanzamiento') DEFAULT 'catalogo',
    preorder_available BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_positive_price CHECK (price >= 0.00),
    CONSTRAINT chk_positive_stock CHECK (stock >= 0)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS click_analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    element_identifier VARCHAR(100) UNIQUE NOT NULL,
    element_description VARCHAR(255) NOT NULL,
    accumulated_clicks INT UNSIGNED DEFAULT 0,
    last_triggered TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

INSERT INTO click_analytics (element_identifier, element_description, accumulated_clicks) VALUES
('btn_agregar_carrito', 'Clic en el botón de añadir producto al carro de compras', 0),
('enlace_navbar_catalogo', 'Navegación al catálogo desde el menú de navegación principal', 0),
('enlace_navbar_carrito', 'Acceso directo a la vista detallada del carrito de compras', 0),
('imagen_producto_detalle', 'Clic de inspección ampliada sobre la imagen del producto TCG', 0),
('toggle_tema_color', 'Alternancia entre la visualización de modo claro y modo oscuro', 0)
ON DUPLICATE KEY UPDATE element_identifier = element_identifier;


CREATE TABLE IF NOT EXISTS restock_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    requested_quantity INT UNSIGNED DEFAULT 1,
    season_key VARCHAR(20) NOT NULL,
    source ENUM('web', 'whatsapp', 'admin') DEFAULT 'web',
    status ENUM('en_espera', 'elegible_admin', 'aprobado', 'rechazado', 'cancelado', 'contactado', 'resuelto') DEFAULT 'en_espera',
    waiting_message VARCHAR(255) NULL,
    threshold_snapshot INT UNSIGNED DEFAULT 25,
    interest_snapshot INT UNSIGNED DEFAULT 0,
    cancelled_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_restock_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_restock_customer_season (product_id, customer_email, season_key),
    INDEX idx_restock_product (product_id),
    INDEX idx_restock_status (status),
    INDEX idx_restock_season (season_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_interest_stats (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    season_key VARCHAR(20) NOT NULL,
    product_views INT UNSIGNED DEFAULT 0,
    product_clicks INT UNSIGNED DEFAULT 0,
    whatsapp_messages INT UNSIGNED DEFAULT 0,
    restock_threshold INT UNSIGNED DEFAULT 25,
    launch_threshold INT UNSIGNED DEFAULT 15,
    last_evaluated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_interest_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY uq_product_interest_season (product_id, season_key),
    INDEX idx_interest_season (season_key)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS launch_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR(255) NOT NULL,
    franchise VARCHAR(120) NOT NULL,
    customer_email VARCHAR(255) NULL,
    requested_quantity INT UNSIGNED DEFAULT 1,
    notes TEXT NULL,
    status ENUM('pedido', 'en_revision', 'confirmado', 'rechazado') DEFAULT 'pedido',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_launch_franchise (franchise),
    INDEX idx_launch_status (status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS customer_research (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_email VARCHAR(255) NULL,
    favorite_franchise VARCHAR(120) NOT NULL,
    satisfaction_score TINYINT UNSIGNED NOT NULL,
    preferred_budget DECIMAL(10, 2) NULL,
    play_style ENUM('competitivo', 'coleccionista', 'casual', 'inversion') DEFAULT 'casual',
    trivia_answer VARCHAR(255) NULL,
    comments TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_satisfaction_range CHECK (satisfaction_score BETWEEN 1 AND 5),
    INDEX idx_research_franchise (favorite_franchise),
    INDEX idx_research_play_style (play_style)
) ENGINE=InnoDB;
