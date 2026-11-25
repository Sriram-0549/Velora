resource "docker_image" "nginx" {
  name         = var.nginx_image
  keep_locally = true
}

resource "docker_network" "nginx_network" {
  name = var.network_name
}

resource "docker_container" "nginx" {
  name  = var.container_name
  image = docker_image.nginx.image_id

  networks_advanced {
    name = docker_network.nginx_network.name
  }

  ports {
    internal = var.internal_port
    external = var.external_port
  }
}
