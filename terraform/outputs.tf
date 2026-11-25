output "nginx_url" {
  description = "URL to open Nginx in your browser"
  value       = "http://localhost:${var.external_port}"
}

output "container_name" {
  description = "Name of the Nginx container"
  value       = docker_container.nginx.name
}

output "network_name" {
  description = "Name of the dedicated Docker network"
  value       = docker_network.nginx_network.name
}

output "image_name" {
  description = "Nginx image used by the container"
  value       = docker_image.nginx.name
}
