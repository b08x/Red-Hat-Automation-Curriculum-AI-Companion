
import React from 'react';
import type { CurriculumPart } from '../types';
import { InteractiveTable } from '../components/KanbanColumn';

export type Curriculum = CurriculumPart;

export const curriculumData: Curriculum[] = [
    {
      title: "Part I: RHCSA Foundation",
      description: "This foundational part of the curriculum is designed to build the essential, hands-on skills required to proficiently administer a standalone Red Hat Enterprise Linux server. Every task is approached from a manual, procedural perspective to instill a deep and granular understanding of the system's core components.",
      objectiveMapping: [
        { category: "Understand and use essential tools", module: "Module 1: Core Enterprise Linux Operations" },
        { category: "Create simple shell scripts", module: "Module 1: Core Enterprise Linux Operations" },
        { category: "Operate running systems", module: "Module 2: System Lifecycle and Storage Management" },
        { category: "Configure local storage", module: "Module 2: System Lifecycle and Storage Management" },
        { category: "Create and configure file systems", module: "Module 3: Filesystem and Network Configuration" },
        { category: "Deploy, configure, and maintain systems", module: "Module 4: System Maintenance and Security" },
        { category: "Manage basic networking", module: "Module 3: Filesystem and Network Configuration" },
        { category: "Manage users and groups", module: "Module 4: System Maintenance and Security" },
        { category: "Manage security", module: "Module 4: System Maintenance and Security" },
        { category: "Manage containers", module: "Module 5: Introduction to Containerization with Podman" },
      ],
      modules: [
        { title: "Module 1: Core Enterprise Linux Operations", content: `The objective of this module is to achieve fluency with the command-line interface (CLI) and the essential tools for system interaction. This includes accessing the shell, understanding correct command syntax, and mastering input/output redirection (>, >>, |, 2>). Proficiency will be developed in text analysis using grep and regular expressions, which are fundamental for parsing logs and command output. Secure remote system access will be taught using SSH, with an emphasis on establishing and using key-based authentication for enhanced security. Core file and directory management operations (ls, cp, mv, rm), including the creation of hard and soft links, will be covered in depth. Students will also learn to archive and compress files using standard utilities like tar, gzip, and bzip2. A key skill for any administrator is the ability to find and use system documentation, so this module covers the use of man, info, and the resources available in /usr/share/doc. Finally, a foundation in shell scripting will be established, covering conditional execution with if/test structures, for loops for processing files and command-line input, and handling script arguments ($1, $2, etc.).` },
        { title: "Module 2: System Lifecycle and Storage Management", content: `This module focuses on understanding and managing the system's boot process, running services, and local storage architecture. Students will learn the complete RHEL boot process, including normal boot, reboot, and shutdown procedures, as well as how to interrupt the boot sequence to gain access for system recovery. A significant portion will be dedicated to managing system services with systemd, covering how to start, stop, and enable services to launch at boot, and how to interpret their status using systemctl. Process management skills will be developed, including how to identify CPU and memory-intensive processes and adjust process scheduling priorities. For troubleshooting, students will learn to locate and interpret system log files using journalctl. The module concludes with a deep dive into local storage configuration. This includes listing, creating, and deleting partitions on both MBR and GPT disks, and a comprehensive section on Logical Volume Management (LVM), covering the creation and management of physical volumes, volume groups, and logical volumes.` },
        { title: "Module 3: Filesystem and Network Configuration", content: `The objective of this module is to configure the filesystems and network connectivity required for a functional server. Students will learn to create, mount, unmount, and use standard Linux filesystems such as ext4 and xfs. A critical skill covered is the configuration of persistent mounts by editing the /etc/fstab file, with a focus on using the universally unique ID (UUID) of a device to ensure reliability across reboots. The module will then transition to network configuration, teaching the use of tools like nmcli and nmtui to configure IPv4 and IPv6 addresses and set up hostname resolution. Finally, the module will cover the configuration of network-based filesystems, specifically mounting NFS shares and configuring autofs to automatically mount network resources on demand.` },
        { title: "Module 4: System Maintenance and Security", content: `This module covers the routine maintenance tasks and foundational security controls essential for any production server. It begins with user and group administration, including creating, modifying, and deleting local user accounts and groups, as well as managing password policies. Students will learn to manage software packages using the dnf utility, including installing, updating, and removing software from configured repositories. Task scheduling using at for one-time tasks and cron for recurring jobs will be covered in detail. The second half of the module focuses on security. Students will learn to manage the system's host-based firewall using firewalld, including configuring zones and adding rules for services and ports. A comprehensive introduction to Security-Enhanced Linux (SELinux) will be provided, covering how to set enforcing and permissive modes, list and restore default file contexts, and diagnose and address routine policy violations.` },
        { title: "Module 5: Introduction to Containerization with Podman", 
          content: `To prepare for modern application deployment methodologies and the advanced labs later in the curriculum, this module provides a foundational understanding of OCI containers. The role of containers in modern IT will be explained, contrasting them with traditional virtual machines. Students will gain hands-on skills in running and managing containers using Podman, the daemonless container engine native to RHEL. This includes pulling container images, running containers in both interactive and detached modes, and inspecting container logs and status. This module serves as a critical conceptual bridge, providing the necessary context to understand the containerized osbuild-composer service that will be the centerpiece of the advanced automation labs in Part III.`,
          related: [{ part: "Part III: Advanced Ansible Development", topic: "Part III: Advanced Ansible Development" }]
        }
      ],
      labs: [
        {
          title: "Capstone Lab I: Manual Deployment of a Web Server",
          content: React.createElement("div", null,
            React.createElement("p", null, "This capstone lab synthesizes all the skills acquired in Part I. Students will be tasked with building a fully functional and secured web server from a minimal RHEL installation, performing every step manually. The outcome of this lab is a fully operational, manually configured server. This server's desired state becomes the explicit target for the automation project in Part II, providing a tangible and well-understood goal for the introduction to Ansible. The tasks include:"),
            React.createElement("ol", { className: "list-decimal list-inside mt-4 space-y-2" },
              React.createElement("li", null, "Partitioning a new disk using LVM to create logical volumes for web content and logs."),
              React.createElement("li", null, "Creating and mounting xfs filesystems on the newly created logical volumes."),
              React.createElement("li", null, "Configuring a static IP address and ensuring correct hostname resolution."),
              React.createElement("li", null, "Installing the Apache web server (httpd) package using dnf."),
              React.createElement("li", null, "Configuring firewalld to permanently allow HTTP and HTTPS traffic."),
              React.createElement("li", null, "Setting the correct SELinux file context (httpd_sys_content_t) on the web content directories to allow the web server to read the files."),
              React.createElement("li", null, "Creating a dedicated local user account for managing the website's content."),
              React.createElement("li", null, "Starting and enabling the httpd service with systemd.")
            )
          ),
          related: [{ part: "Part II: RHCE - Automation with Ansible", topic: "Part II: RHCE - Automation with Ansible" }]
        }
      ]
    },
    {
        title: "Part II: RHCE - Automation with Ansible",
        description: "This part of the curriculum introduces Red Hat Ansible Automation as the primary tool for configuration management and orchestration. The central focus is on translating the manual, procedural tasks mastered in Part I into declarative, repeatable, and scalable code. The learning process is structured to instill the core mindset of an automation engineer: defining a desired state rather than merely executing a sequence of commands.",
        objectiveMapping: [
            { category: "Understand core components of Ansible", module: "Module 6: Fundamentals of Ansible Automation" },
            { category: "Install and configure an Ansible control node", module: "Module 6: Fundamentals of Ansible Automation" },
            { category: "Configure Ansible managed nodes", module: "Module 6: Fundamentals of Ansible Automation" },
            { category: "Create static and dynamic inventories", module: "Module 6: Fundamentals of Ansible Automation" },
            { category: "Create Ansible plays and playbooks", module: "Module 7: Building Effective Playbooks" },
            { category: "Use Ansible modules for system administration tasks", module: "Module 7: Building Effective Playbooks" },
            { category: "Work with variables and facts", module: "Module 7: Building Effective Playbooks" },
            { category: "Create and use templates", module: "Module 8: Advanced Ansible Techniques" },
            { category: "Work with Ansible Vault", module: "Module 8: Advanced Ansible Techniques" },
            { category: "Work with Ansible roles", module: "Module 9: Automating Core Administration with Roles" },
            { category: "Use Ansible to configure specific systems", module: "Module 9 & Capstone Lab II" }
        ],
        modules: [
            { title: "Module 6: Fundamentals of Ansible Automation", content: "This module introduces the core concepts and architecture of Ansible. It begins by explaining the agentless architecture, differentiating between the control node, where Ansible is executed, and the managed nodes that are the targets of automation. Students will learn to write static inventory files to define their managed hosts. The module then covers the execution of ad-hoc commands, which are useful for simple, one-off tasks. The primary focus, however, will be the introduction to Ansible Playbooks, covering their YAML structure, plays, and tasks. Students will get hands-on experience with common modules essential for system administration, such as ansible.builtin.ping for connectivity testing, ansible.builtin.dnf for package management, and ansible.builtin.service for managing systemd services." },
            { title: "Module 7: Building Effective Playbooks", content: "This module delves into the core components of playbook development, teaching students how to create robust and flexible automation. A key topic is the use of variables to parameterize playbooks, making them adaptable to different environments. This includes using Ansible facts (discovered data about managed nodes), registering the output of tasks into variables, and defining variables within the inventory. Students will learn to implement loops to repeat tasks efficiently over a list of items, such as installing multiple packages or creating multiple users. The use of conditionals with the when statement will be taught to provide fine-grained control over task execution. Finally, the module introduces handlers, which are special tasks triggered only when a change is made by another task, ensuring that services are restarted only when their configuration files are actually modified." },
            { title: "Module 8: Advanced Ansible Techniques", content: "This module covers advanced Ansible capabilities necessary for managing complex configurations and securing sensitive data. Students will learn to create dynamic configuration files using the Jinja2 templating engine, allowing them to generate customized files based on variables for each managed host. A critical skill for production environments is the management of secrets, such as passwords and API keys. This module provides comprehensive instruction on using Ansible Vault to encrypt sensitive data within the automation project. Students will also learn to control task execution with greater precision, covering privilege escalation (become), the use of tags to run specific parts of a playbook, and strategies for error handling to make playbooks more resilient." },
            { title: "Module 9: Automating Core Administration with Roles", 
              content: "The concept of Ansible Roles is central to creating reusable and maintainable automation. This module focuses on structuring Ansible content into a standardized, role-based directory structure. Students will apply this concept by creating a comprehensive set of roles that directly correspond to the manual administration tasks covered in Part I. This will include creating a storage role to manage LVM and filesystems, a networking role to configure network interfaces, a security role to manage firewalld and SELinux settings, and an apache role to install, configure, and manage the web server.",
              related: [{ part: "Part I: RHCSA Foundation", topic: "Part I: RHCSA Foundation" }]
            }
        ],
        labs: [
            { title: "Capstone Lab II: From Manual to Fully Automated Deployment", 
              content: React.createElement("div", null, 
                React.createElement("p", null, "This capstone lab is the culmination of the RHCE curriculum. The objective is to author a master Ansible playbook that applies the roles developed in Module 9 to a fresh, minimal RHEL installation, automatically configuring it to the exact desired state of the server built manually in Capstone Lab I. The tasks include:"),
                React.createElement("ol", {className: "list-decimal list-inside mt-4 space-y-2"},
                  React.createElement("li", null, "Initializing a Git repository to store the entire Ansible project, introducing version control as a best practice."),
                  React.createElement("li", null, "Developing a complete and tested set of roles for storage, networking, security, and the Apache web server."),
                  React.createElement("li", null, "Creating a master site.yml playbook that orchestrates the application of these roles in the correct, logical order."),
                  React.createElement("li", null, "Executing the playbook against a new, unconfigured virtual machine."),
                  React.createElement("li", null, "Performing a verification step to confirm that the newly provisioned VM is configured identically to the one from Capstone Lab I.")
                ),
                React.createElement("p", {className: "mt-4"}, "The outcome is a version-controlled, fully automated process for deploying and configuring a web server. This lab provides a tangible demonstration of mastery over the core skills required for the RHCE certification and showcases the power of infrastructure as code.")
              ),
              related: [
                  { part: "Part I: RHCSA Foundation", topic: "Capstone Lab I: Manual Deployment of a Web Server" },
                  { part: "Part II: RHCE - Automation with Ansible", topic: "Module 9: Automating Core Administration with Roles" },
              ]
            }
        ]
    },
    {
        title: "Part III: Advanced Ansible Development",
        description: "This part of the curriculum marks a significant conceptual shift, elevating the student from an Ansible user to an Ansible developer. The focus moves beyond configuring a running operating system to automating the creation of the operating system image itself. This approach aligns with modern DevOps paradigms that treat the OS as a version-controlled, buildable artifact rather than a static entity configured post-deployment.",
        objectiveMapping: [
            { category: "Understand and use Git", module: "Capstone Lab II & III" },
            { category: "Manage inventory variables", module: "Module 7 & 14" },
            { category: "Manage task execution", module: "Module 8 & 13" },
            { category: "Transform data with filters and plugins", module: "Module 13: Advanced Data Handling" },
            { category: "Delegate tasks", module: "Module 12: Orchestrating Image Builds" },
            { category: "Manage content collections", module: "Module 12 & 13" },
            { category: "Manage execution environments", module: "Module 10 & 14" },
            { category: "Manage inventories and credentials in automation controller", module: "Module 14: Intro to Ansible Automation Platform" },
            { category: "Manage automation controller", module: "Module 14 & Capstone Lab III" }
        ],
        modules: [
            { title: "Module 10: Architecting the Automation Environment (The Image Factory)", content: "This module establishes the self-hosted, containerized image factory that serves as the core lab environment for Part III. It begins with a crucial conceptual shift: deconstructing the managed, UI-driven Red Hat Hybrid Cloud Console to understand and deploy the underlying open-source engine, osbuild-composer. This transition moves the student from a SaaS consumer to a self-hosted service operator, embracing an automation-centric paradigm. The primary lab activity is to containerize the image factory by deploying the official osbuild/osbuild-composer-container image using Podman and Podman Desktop. This approach creates a portable, isolated, 'build-as-a-service' micro-architecture." },
            { title: "Module 11: Golden Images as Code with Blueprints", content: "This module introduces the concept of defining custom RHEL images declaratively using the TOML blueprint format. This embodies an Infrastructure as Code (IaC) methodology, where image definitions become versionable, auditable artifacts that can be managed like application code. Students will learn the anatomy of a blueprint, including defining metadata such as name, version, and the mandatory distro field, as well as specifying software packages and user accounts. The module then explores advanced customizations, such as gaining granular control over filesystem layouts and embedding scripts to be run on first boot." },
            { title: "Module 12: Orchestrating Image Builds with Ansible", 
              content: "With the image factory established and blueprints defined, this module focuses on using Ansible to create a declarative, playbook-driven workflow for orchestrating image builds. It introduces the infra.osbuild collection, an Ansible Content Collection specifically designed for managing osbuild-composer. Students will use the infra.osbuild.builder role, which provides a high-level, declarative interface that abstracts away the underlying sequence of composer-cli commands into a simple, variable-driven playbook. A key practical skill taught is the integration of Ansible with the containerized lab environment.",
              related: [
                  {part: "Part III: Advanced Ansible Development", topic: "Module 10: Architecting the Automation Environment (The Image Factory)"},
                  {part: "Part III: Advanced Ansible Development", topic: "Module 11: Golden Images as Code with Blueprints"}
              ]
            },
            { title: "Module 13: Advanced Data Handling and Dynamic Configuration", content: "This module covers advanced Ansible features for data manipulation and introduces a highly agile, dynamic configuration model. Students will learn to use Jinja2 filters and lookup plugins to populate variables and transform data from external sources, a key objective of the EX374 exam. The module then introduces the ansible-pull model, a powerful 'GitOps for Virtual Machines' pattern. In this model, a generic base image is built with a minimal configuration, and upon first boot, it pulls a complete Ansible configuration from a Git repository and applies it locally." },
            { title: "Module 14: Introduction to Ansible Automation Platform", 
              content: "This module provides a foundational understanding of the core components of the Ansible Automation Platform, which are central to the EX374 and EX467 certifications. It introduces Automation Controller as the centralized control plane for enterprise automation, covering the management of inventories, credentials, and Projects. The concept of Execution Environments is explained as the modern, container-based method for bundling Ansible and its dependencies, ensuring that automation runs consistently everywhere. Finally, the role of a private Automation Hub is introduced as a central repository for managing and distributing custom-built collections.",
              related: [{part: "Part IV: Managing the Automation Platform", topic: "Part IV: Managing the Automation Platform"}]
            }
        ],
        labs: [
            { title: "Capstone Lab III: Building a CI Pipeline for Golden Images", 
              content: React.createElement("div", null,
                React.createElement("p", null, "This capstone lab integrates the key technologies from Part III to create an automated pipeline for building a custom qcow2 virtual machine image. The objective is to demonstrate a controller-managed workflow that turns code into a deployable OS artifact. The tasks include:"),
                React.createElement("ol", {className: "list-decimal list-inside mt-4 space-y-2"},
                  React.createElement("li", null, "Storing the ansible-pull blueprint (from Module 13) and the Ansible playbook that orchestrates the image build (from Module 12) in a Git repository."),
                  React.createElement("li", null, "Configuring an Automation Controller Project to sync with this Git repository."),
                  React.createElement("li", null, "Creating a Job Template in Automation Controller that is configured to run the image-building playbook."),
                  React.createElement("li", null, "Manually launching the Job Template from the Automation Controller UI and verifying that the qcow2 image artifact is successfully built and exported from the containerized image factory.")
                ),
                React.createElement("p", {className: "mt-4"}, "The outcome is a functioning, controller-managed pipeline for producing version-controlled virtual machine images.")
              ),
              related: [
                  { part: "Part III: Advanced Ansible Development", topic: "Module 12: Orchestrating Image Builds with Ansible" },
                  { part: "Part III: Advanced Ansible Development", topic: "Module 13: Advanced Data Handling and Dynamic Configuration" },
                  { part: "Part III: Advanced Ansible Development", topic: "Module 14: Introduction to Ansible Automation Platform" }
              ]
            }
        ]
    },
    {
        title: "Part IV: Managing the Automation Platform",
        description: "This final part of the curriculum focuses on the operational, architectural, and administrative aspects of managing the Ansible Automation Platform at an enterprise scale. The student will learn to install, configure, secure, and scale the platform itself, shifting their perspective from a consumer of automation to the provider of a robust, reliable automation service for an entire organization.",
        objectiveMapping: [
            { category: "Install Ansible Automation Platform", module: "Module 15: Deploying Ansible Automation Platform" },
            { category: "Configure Private Automation Hub", module: "Module 15 & 16" },
            { category: "Configure automation controller", module: "Module 15 & 16" },
            { category: "Manage access for automation controller & hub", module: "Module 16: Enterprise Access Control" },
            { category: "Manage inventories and credentials", module: "Module 14 & 18" },
            { category: "Manage automation controller projects", module: "Module 14 & 17" },
            { category: "Manage automation controller workflows", module: "Module 17: Advanced Project and Workflow Orchestration" },
            { category: "Manage advanced inventories", module: "Module 18: Scaling Automation" },
            { category: "Work with the automation controller API", module: "Module 19: Platform Integration and Maintenance" },
            { category: "Install and configure automation mesh", module: "Module 18: Scaling Automation" },
            { category: "Back up Ansible Automation Platform", module: "Module 19: Platform Integration and Maintenance" }
        ],
        modules: [
            { title: "Module 15: Deploying Ansible Automation Platform", content: "This module covers the installation and initial configuration of the two main components of the Ansible Automation Platform. Students will learn the procedures for installing Automation Controller and a private Automation Hub. Following the installation, the module will cover essential post-installation configuration steps and system verification checks to ensure the platform is operational and ready for use." },
            { title: "Module 16: Enterprise Access Control and Governance", content: "A primary responsibility of a platform administrator is implementing a robust access control model that enables secure, multi-tenant automation. This module provides in-depth instruction on this topic. Within Automation Controller, students will learn to create organizations, users, and teams, and then configure a granular system of roles and permissions to control access to inventories, credentials, and job templates. In parallel, for the private Automation Hub, they will learn to create user groups and manage permissions for controlling access to content collections and execution environments." },
            { title: "Module 17: Advanced Project and Workflow Orchestration", content: "This module focuses on building complex, multi-step automation using the advanced features of Automation Controller. Students will learn to create job templates that include surveys, which prompt users for input at launch time, making automation more interactive and flexible. A key skill is using the variables gathered from these surveys within playbooks and Jinja2 templates. The module culminates in creating Workflow Templates, which allow for the chaining of multiple job templates together." },
            { title: "Module 18: Scaling Automation with Advanced Inventories and Mesh", content: "This module addresses the challenges of managing large-scale inventories and distributing automation execution across complex networks. Students will learn to work with advanced inventory features, including importing external static inventories and creating dynamic Smart Inventories that group hosts based on discovered facts or custom labels. To address distributed execution, the module covers the installation and configuration of Automation Mesh. This involves creating instance groups that allow job execution to be farmed out to remote execution nodes." },
            { title: "Module 19: Platform Integration and Maintenance", content: "The final module on platform management covers programmatic interaction and essential maintenance procedures. Students will learn the basics of working with the Automation Controller API, which allows for the integration of the platform with other tools and CI/CD systems, such as programmatically launching jobs and retrieving their status. The module concludes with a critical operational topic: implementing a backup and recovery strategy." }
        ],
        labs: [
            { title: "Capstone Lab IV: End-to-End Workload Deployment to OpenShift", 
              content: React.createElement("div", null,
                React.createElement("p", null, "This final capstone lab provides a comprehensive, end-to-end demonstration of a governed, 'code-to-cloud' workflow, integrating all concepts from the entire curriculum. The objective is to use the full power of the Ansible Automation Platform to orchestrate the deployment of the custom VM image (built in Capstone Lab III) into an OpenShift Local testbed. The tasks include:"),
                React.createElement("ol", {className: "list-decimal list-inside mt-4 space-y-2"},
                  React.createElement("li", null, "Configuring an OpenShift Local instance on the lab machine."),
                  React.createElement("li", null, "In Automation Controller, creating a multi-step workflow template to build the qcow2 image, stage it on an HTTP server, and apply a VirtualMachine manifest to the OpenShift cluster."),
                  React.createElement("li", null, "Implementing an enterprise governance model by configuring access controls so that a 'developer' team can run the workflow, but an 'operations' team is required to manually approve the final deployment step."),
                  React.createElement("li", null, "Executing the entire workflow, including the manual approval step, and verifying that the custom VM is successfully provisioned.")
                ),
                React.createElement("p", {className: "mt-4"}, "The outcome is a fully governed, end-to-end automation pipeline that builds a custom OS artifact and deploys it as a workload on a container platform.")
              ),
              related: [
                  { part: "Part III: Advanced Ansible Development", topic: "Capstone Lab III: Building a CI Pipeline for Golden Images" },
                  { part: "Part IV: Managing the Automation Platform", topic: "Module 16: Enterprise Access Control and Governance" },
                  { part: "Part IV: Managing the Automation Platform", topic: "Module 17: Advanced Project and Workflow Orchestration" },
              ]
            }
        ]
    },
    {
        title: "Concluding Module: The Automation Ecosystem",
        description: "This final module provides strategic context, placing Ansible within the broader ecosystem of RHEL management tools. This ensures that students graduate not just with proficiency in a single tool, but with the architectural wisdom to select the right tool for the right job in a complex enterprise environment. The discussion is based on a comparative analysis of three distinct but complementary management paradigms: Ansible (The Automation Engine), Cockpit (The Interactive Dashboard), and Foreman/Katello (The Lifecycle Platform). Understanding these distinctions is critical, as they represent different layers of a mature operational model.",
        modules: [
            {
                title: "Tooling Comparison",
                content: React.createElement(InteractiveTable, {
                  headers: ["Tool", "Primary Scope", "Operational Paradigm", "Core Use Case", "Analogy"],
                  rows: [
                      ["Ansible", "Multi-host Orchestration", "Declarative (Code)", "Automated provisioning & configuration", "The Architect's Blueprints"],
                      ["Cockpit", "Single-Host Inspection", "Interactive (GUI)", "Real-time troubleshooting & admin", "The Mechanic's Dashboard"],
                      ["Foreman/Katello", "Fleet & Content Lifecycle", "Stateful (Database)", "Patch/errata management & compliance", "The Fleet Manager's Logistics System"],
                  ],
                  fileName: "tooling-comparison.csv"
              })
            }
        ]
    }
];