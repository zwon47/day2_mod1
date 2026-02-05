"""
Initial seed data for the database
Based on the sample data from .claude/docs/readme.md Section 9.4
"""

from sqlalchemy.orm import Session
from app.models.network_segment import NetworkSegment
from app.models.firewall import Firewall
from app.models.firewall_rule import FirewallRule


def seed_database(db: Session):
    """
    Populate database with initial sample data

    Creates:
    - 30 network segments (diverse zones and IP ranges)
    - 1 firewall device
    - Multiple firewall rules
    """

    # Check if data already exists
    existing_segments = db.query(NetworkSegment).count()
    if existing_segments > 0:
        print("Database already contains data. Skipping seed.")
        return

    print("Seeding database with sample data...")

    # 1. Create Network Segments (30 total)
    segments = [
        # External/Internet (1)
        NetworkSegment(
            name='Internet',
            ip_range='0.0.0.0/0',
            zone_type='External',
            color='#E74C3C',
            description='Public Internet'
        ),
        # DMZ Zones (4)
        NetworkSegment(
            name='DMZ Zone',
            ip_range='10.0.1.0/24',
            zone_type='DMZ',
            color='#FF6B6B',
            description='Public-facing services'
        ),
        NetworkSegment(
            name='DMZ Web',
            ip_range='10.0.5.0/24',
            zone_type='DMZ',
            color='#FF8C8C',
            description='DMZ web services'
        ),
        NetworkSegment(
            name='DMZ API Gateway',
            ip_range='10.0.6.0/24',
            zone_type='DMZ',
            color='#FFAAAA',
            description='API gateway zone'
        ),
        NetworkSegment(
            name='DMZ Load Balancers',
            ip_range='10.0.7.0/24',
            zone_type='DMZ',
            color='#FFC8C8',
            description='Load balancer zone'
        ),
        # Internal Production Zones (10)
        NetworkSegment(
            name='Web Servers',
            ip_range='10.0.2.0/24',
            zone_type='Internal',
            color='#4ECDC4',
            description='Frontend web servers'
        ),
        NetworkSegment(
            name='App Servers',
            ip_range='10.0.3.0/24',
            zone_type='Internal',
            color='#95E1D3',
            description='Backend application servers'
        ),
        NetworkSegment(
            name='DB Servers',
            ip_range='10.0.4.0/24',
            zone_type='Internal',
            color='#F38181',
            description='Database servers'
        ),
        NetworkSegment(
            name='Cache Servers',
            ip_range='10.0.8.0/24',
            zone_type='Internal',
            color='#A8E6CF',
            description='Redis/Memcached cache layer'
        ),
        NetworkSegment(
            name='Message Queue',
            ip_range='10.0.9.0/24',
            zone_type='Internal',
            color='#FFD3B6',
            description='RabbitMQ/Kafka messaging'
        ),
        NetworkSegment(
            name='Search Cluster',
            ip_range='10.0.10.0/24',
            zone_type='Internal',
            color='#FFAAA5',
            description='Elasticsearch cluster'
        ),
        NetworkSegment(
            name='Analytics',
            ip_range='10.0.11.0/24',
            zone_type='Internal',
            color='#FF8B94',
            description='Analytics processing servers'
        ),
        NetworkSegment(
            name='Backup Systems',
            ip_range='10.0.12.0/24',
            zone_type='Internal',
            color='#C7CEEA',
            description='Backup and disaster recovery'
        ),
        NetworkSegment(
            name='Storage Network',
            ip_range='10.0.13.0/24',
            zone_type='Internal',
            color='#B5EAD7',
            description='NAS/SAN storage network'
        ),
        NetworkSegment(
            name='Monitoring',
            ip_range='10.0.14.0/24',
            zone_type='Internal',
            color='#FFDAC1',
            description='Monitoring and logging systems'
        ),
        # Development/Testing Zones (6)
        NetworkSegment(
            name='Dev Network',
            ip_range='172.16.0.0/16',
            zone_type='Internal',
            color='#AA96DA',
            description='Development environment'
        ),
        NetworkSegment(
            name='Dev Web',
            ip_range='172.17.1.0/24',
            zone_type='Internal',
            color='#B5A6E6',
            description='Development web servers'
        ),
        NetworkSegment(
            name='Dev App',
            ip_range='172.17.2.0/24',
            zone_type='Internal',
            color='#C0B6F2',
            description='Development app servers'
        ),
        NetworkSegment(
            name='Dev DB',
            ip_range='172.17.3.0/24',
            zone_type='Internal',
            color='#CBC6FE',
            description='Development databases'
        ),
        NetworkSegment(
            name='QA Environment',
            ip_range='172.18.0.0/16',
            zone_type='Internal',
            color='#D6D0FF',
            description='Quality assurance testing'
        ),
        NetworkSegment(
            name='Staging',
            ip_range='172.19.0.0/16',
            zone_type='Internal',
            color='#E1DCFF',
            description='Staging environment'
        ),
        # Management/Admin Zones (5)
        NetworkSegment(
            name='Management',
            ip_range='192.168.100.0/24',
            zone_type='Management',
            color='#FCBAD3',
            description='Admin/management network'
        ),
        NetworkSegment(
            name='Jump Servers',
            ip_range='192.168.101.0/24',
            zone_type='Management',
            color='#FCC8DD',
            description='Bastion/jump hosts'
        ),
        NetworkSegment(
            name='VPN Access',
            ip_range='192.168.102.0/24',
            zone_type='Management',
            color='#FDD6E7',
            description='VPN endpoint network'
        ),
        NetworkSegment(
            name='Security Tools',
            ip_range='192.168.103.0/24',
            zone_type='Management',
            color='#FEE4F1',
            description='Security scanning and tools'
        ),
        NetworkSegment(
            name='Admin Workstations',
            ip_range='192.168.104.0/24',
            zone_type='Management',
            color='#FFF2FB',
            description='Administrator workstations'
        ),
        # Guest/IoT Zones (3)
        NetworkSegment(
            name='Guest WiFi',
            ip_range='192.168.200.0/24',
            zone_type='External',
            color='#E8E8E8',
            description='Guest wireless network'
        ),
        NetworkSegment(
            name='IoT Devices',
            ip_range='192.168.201.0/24',
            zone_type='Internal',
            color='#D0D0D0',
            description='IoT and smart devices'
        ),
        NetworkSegment(
            name='Contractor Network',
            ip_range='192.168.202.0/24',
            zone_type='Internal',
            color='#B8B8B8',
            description='Third-party contractor access'
        ),
        # Partner Integration (1)
        NetworkSegment(
            name='Partner VPN',
            ip_range='10.100.0.0/16',
            zone_type='DMZ',
            color='#A0A0A0',
            description='Partner integration network'
        ),
    ]

    for segment in segments:
        db.add(segment)

    db.commit()
    print(f"Created {len(segments)} network segments")

    # 2. Create Firewall
    firewall = Firewall(
        name='Main Gateway FW',
        vendor='Palo Alto',
        model='PA-5220',
        management_ip='192.168.100.1'
    )
    db.add(firewall)
    db.commit()
    print("Created 1 firewall device")

    # 3. Create Firewall Rules
    # Note: segment IDs are 1-30 in order, firewall ID is 1
    rules = [
        # Internet to DMZ Rules (1->2,3,4,5)
        FirewallRule(
            firewall_id=1,
            rule_name='Internet to DMZ Zone',
            source_segment_id=1,
            destination_segment_id=2,
            protocol='TCP',
            port_range='80,443',
            action='ALLOW',
            description='Public web access to DMZ'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Internet to DMZ Web',
            source_segment_id=1,
            destination_segment_id=3,
            protocol='TCP',
            port_range='80,443',
            action='ALLOW',
            description='Public HTTPS to DMZ web'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Internet to API Gateway',
            source_segment_id=1,
            destination_segment_id=4,
            protocol='TCP',
            port_range='443',
            action='ALLOW',
            description='API access from internet'
        ),
        # DMZ to Internal Production Rules
        FirewallRule(
            firewall_id=1,
            rule_name='DMZ to Web Servers',
            source_segment_id=2,
            destination_segment_id=6,
            protocol='TCP',
            port_range='80,443,8080',
            action='ALLOW',
            description='DMZ to internal web servers'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='DMZ LB to Web',
            source_segment_id=5,
            destination_segment_id=6,
            protocol='TCP',
            port_range='80,443',
            action='ALLOW',
            description='Load balancer to web'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Web to App Servers',
            source_segment_id=6,
            destination_segment_id=7,
            protocol='TCP',
            port_range='8000-9000',
            action='ALLOW',
            description='Web to app tier API'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='App to DB Servers',
            source_segment_id=7,
            destination_segment_id=8,
            protocol='TCP',
            port_range='3306,5432',
            action='ALLOW',
            description='App to database'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='App to Cache',
            source_segment_id=7,
            destination_segment_id=9,
            protocol='TCP',
            port_range='6379',
            action='ALLOW',
            description='App to Redis cache'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='App to Message Queue',
            source_segment_id=7,
            destination_segment_id=10,
            protocol='TCP',
            port_range='5672,9092',
            action='ALLOW',
            description='App to RabbitMQ/Kafka'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='App to Search',
            source_segment_id=7,
            destination_segment_id=11,
            protocol='TCP',
            port_range='9200,9300',
            action='ALLOW',
            description='App to Elasticsearch'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Analytics Read DB',
            source_segment_id=12,
            destination_segment_id=8,
            protocol='TCP',
            port_range='3306',
            action='ALLOW',
            description='Analytics DB read access'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Backup to Storage',
            source_segment_id=13,
            destination_segment_id=14,
            protocol='TCP',
            port_range='2049,445',
            action='ALLOW',
            description='Backup to NAS/SAN'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Monitoring to All Internal',
            source_segment_id=15,
            destination_segment_id=6,
            protocol='TCP',
            port_range='9090,9100',
            action='ALLOW',
            description='Prometheus monitoring'
        ),
        # Development Environment Rules
        FirewallRule(
            firewall_id=1,
            rule_name='Dev Web to Dev App',
            source_segment_id=17,
            destination_segment_id=18,
            protocol='TCP',
            port_range='8000-9000',
            action='ALLOW',
            description='Dev web to app'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Dev App to Dev DB',
            source_segment_id=18,
            destination_segment_id=19,
            protocol='TCP',
            port_range='3306,5432',
            action='ALLOW',
            description='Dev app to database'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Dev to Prod DB - DENY',
            source_segment_id=16,
            destination_segment_id=8,
            protocol='ANY',
            port_range=None,
            action='DENY',
            description='Block dev to production DB'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='QA to Staging',
            source_segment_id=20,
            destination_segment_id=21,
            protocol='TCP',
            port_range='80,443,8080',
            action='ALLOW',
            description='QA to staging environment'
        ),
        # Management/Admin Access Rules
        FirewallRule(
            firewall_id=1,
            rule_name='Management SSH to Web',
            source_segment_id=22,
            destination_segment_id=6,
            protocol='TCP',
            port_range='22',
            action='ALLOW',
            description='Admin SSH to web servers'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Management SSH to App',
            source_segment_id=22,
            destination_segment_id=7,
            protocol='TCP',
            port_range='22',
            action='ALLOW',
            description='Admin SSH to app servers'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Management SSH to DB',
            source_segment_id=22,
            destination_segment_id=8,
            protocol='TCP',
            port_range='22',
            action='ALLOW',
            description='Admin SSH to DB servers'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Jump Server to Internal',
            source_segment_id=23,
            destination_segment_id=7,
            protocol='TCP',
            port_range='22,3389',
            action='ALLOW',
            description='Jump server access'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='VPN to Management',
            source_segment_id=24,
            destination_segment_id=22,
            protocol='TCP',
            port_range='22,443',
            action='ALLOW',
            description='VPN users to management'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Security Scan Internal',
            source_segment_id=25,
            destination_segment_id=6,
            protocol='TCP',
            port_range='1-65535',
            action='ALLOW',
            description='Security scanning'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Admin Workstation to Mgmt',
            source_segment_id=26,
            destination_segment_id=22,
            protocol='TCP',
            port_range='22,443,3389',
            action='ALLOW',
            description='Admin workstation access'
        ),
        # Guest/IoT Restrictions
        FirewallRule(
            firewall_id=1,
            rule_name='Guest to Internet Only',
            source_segment_id=27,
            destination_segment_id=1,
            protocol='TCP',
            port_range='80,443',
            action='ALLOW',
            description='Guest internet access'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Guest to Internal - DENY',
            source_segment_id=27,
            destination_segment_id=6,
            protocol='ANY',
            port_range=None,
            action='DENY',
            description='Block guest to internal'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='IoT to Monitoring',
            source_segment_id=28,
            destination_segment_id=15,
            protocol='TCP',
            port_range='8086,1883',
            action='ALLOW',
            description='IoT telemetry'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='IoT to Production - DENY',
            source_segment_id=28,
            destination_segment_id=7,
            protocol='ANY',
            port_range=None,
            action='DENY',
            description='Block IoT to production'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Contractor Limited Access',
            source_segment_id=29,
            destination_segment_id=16,
            protocol='TCP',
            port_range='80,443',
            action='ALLOW',
            description='Contractor to dev only'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Contractor to Prod - DENY',
            source_segment_id=29,
            destination_segment_id=6,
            protocol='ANY',
            port_range=None,
            action='DENY',
            description='Block contractor to production'
        ),
        # Partner Integration
        FirewallRule(
            firewall_id=1,
            rule_name='Partner to API Gateway',
            source_segment_id=30,
            destination_segment_id=4,
            protocol='TCP',
            port_range='443',
            action='ALLOW',
            description='Partner API access'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Partner to Internal - DENY',
            source_segment_id=30,
            destination_segment_id=7,
            protocol='ANY',
            port_range=None,
            action='DENY',
            description='Block partner to internal'
        ),
        # Additional cross-tier rules
        FirewallRule(
            firewall_id=1,
            rule_name='Monitoring to DB',
            source_segment_id=15,
            destination_segment_id=8,
            protocol='TCP',
            port_range='9104',
            action='ALLOW',
            description='DB metrics collection'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Backup to DB',
            source_segment_id=13,
            destination_segment_id=8,
            protocol='TCP',
            port_range='3306',
            action='ALLOW',
            description='Database backup'
        ),
        FirewallRule(
            firewall_id=1,
            rule_name='Cache to Storage',
            source_segment_id=9,
            destination_segment_id=14,
            protocol='TCP',
            port_range='2049',
            action='ALLOW',
            description='Cache persistence to storage'
        ),
    ]

    for rule in rules:
        db.add(rule)

    db.commit()
    print(f"Created {len(rules)} firewall rules")
    print("Database seeding completed successfully!")


if __name__ == "__main__":
    # Allow running this script directly for testing
    from app.database import SessionLocal

    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()
