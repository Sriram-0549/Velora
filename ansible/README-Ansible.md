# NEXUS — Ansible Configuration Automation

## Objective

Ansible is used in the NEXUS DevOps project to automate Linux environment configuration. This implementation demonstrates package installation, configuration deployment, service management, handlers and idempotency.

## Architecture

- Control environment: WSL Ubuntu
- Target: Local Linux environment
- Configuration management: Ansible
- Web server: Nginx

## Project Structure

```text
ansible/
├── ansible.cfg
├── inventory/
│   └── hosts.ini
├── playbooks/
│   └── configure-environment.yml
├── templates/
│   └── index.html.j2
└── README-ANSIBLE.md
```

## Automation

The playbook automates:

1. Installation of Nginx.
2. Deployment of a custom NEXUS HTML page using a Jinja2 template.
3. Service management to ensure Nginx is running and enabled.
4. Reloading Nginx when the template changes.

## Execution

Test inventory connectivity:

```bash
ansible local -m ping
```

Run the playbook:

```bash
ansible-playbook playbooks/configure-environment.yml -K
```

## Verification

- Verified Nginx installation.
- Verified Nginx service status.
- Verified the deployed page using curl.
- Re-ran the playbook to verify idempotency.
- Modified the template and verified automated updates.

## Outcome

Configuration tasks were automated using Ansible, making the local configuration repeatable and manageable through code.
