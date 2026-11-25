variable "nginx_image" {
  description = "Nginx Docker image to pull"
  type        = string
  default     = "nginx:1.27-alpine"
}

variable "network_name" {
  description = "Name of the dedicated Docker network"
  type        = string
  default     = "velora-tf-network"
}

variable "container_name" {
  description = "Name of the Nginx container"
  type        = string
  default     = "velora-tf-nginx"
}

variable "internal_port" {
  description = "Port Nginx listens on inside the container"
  type        = number
  default     = 80
}

variable "external_port" {
  description = "Port on your machine that maps to the container"
  type        = number
  default     = 8085
}
