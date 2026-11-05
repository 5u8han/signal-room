# Hardware reference for the front-elevation homelab

Researched 2026-11-05 from manufacturer documentation. These are candidate art references, **not a claim that Sub owns these models**. User named actual manufacturer families but has not supplied model inventory.

## Candidate equipment and visual differences

| Role | Candidate reference | What the front should visibly communicate |
| --- | --- | --- |
| 1U compute | Dell PowerEdge R640 | Low, dense chassis; choose a documented 8- or 10-bay SFF front rather than inventing a generic grille. Left control panel and right power/USB/iDRAC Direct panel flank the carriers. |
| 2U general compute | HPE ProLiant DL380 Gen10 | HPE-specific SmartDrive carrier geometry and independent activity rings; distinct media/control area. Use one documented SFF/LFF layout. |
| 2U storage | Dell PowerEdge R740xd | Dense front storage face: documented 24 SFF or 12 LFF configuration. Do not give a plain R740 the xd's 24-SFF front. |
| 4U GPU/AI | Supermicro SYS-420GP-TNR | Taller Supermicro chassis, documented drive arrangement, deep internal GPU section. The installed GPUs should be revealed only in appropriate service/cutaway views. |
| 8U optional large AI system | Supermicro SYS-821GE-TNHR | Genuine 8U HGX chassis with a very different grille/fan/drive composition and rear I/O. Enterprise-scale reference; confirm with Sub before presenting it as actual owned home equipment. |
| 1RU switching | Cisco Catalyst 9300 family | Recognizable 24/48-port front, separate system/status area, right uplink network module where present, many independent link/activity indicators. Pick one SKU before detailed drawing. |
| Firewall reference | Cisco ASA 5516-X | Mostly closed front with four indicators; network connectors are on rear. Do not decorate its front as if it were a Catalyst switch. A pfSense appliance is another possible user-approved firewall choice, model still unconfirmed. |
| Small compute shelf | Intel NUC 11 Pro NUC11TN family | Small square/slim or tall cases on a shelf; front USB and power button, rear networking. Repetition with subtle per-node differences contrasts with the full-width servers. |
| Desktop/workbench | Actual desktop model pending | Distinct upright/small-form-factor silhouette; avoid inventing a vendor/model and calling it owned. Can be a board-repair/workbench scene anchor. |
| UPS | APC Smart-UPS SMT1500RM2U / SMT1500RM2UC family | Heavy 2U unit with front LCD/control area and ventilation; show load/battery state separately from server health. Candidate only; confirm actual UPS brand/model. |
| ASIC appliance | Pending meaning/model | If Sub means a mining ASIC, Antminer S19/S19 Pro has a markedly different fan-dominated housing and Ethernet/controller indicators. ASIC could instead mean networking silicon or an accelerator; ask before choosing. |

## Composition recommendation (design inference)

Use three readable equipment zones rather than a wall of identical servers:

1. **Left network edge:** WAN demarcation/shelf (fiber ONT, coax modem, cellular backup), firewall/router, patching and Cisco switches. Fiber primary, coax secondary, cellular tertiary follow Sub's latest instruction. A cellular hotspot is not a satellite link: confirm if a separate satellite terminal should also exist.
2. **Compute/storage:** a mix of R640, DL380 Gen10 and R740xd fronts, with selected empty bays/blanks, service labels and rack-unit markings. These patterns give the face real structure and usable repair targets.
3. **AI/power/workbench:** 4U system, optional 8U system after confirmation, small-compute shelf, UPS low in the rack, nearby desktop/repair bench. The 8U enterprise machine should not be automatically inserted just to satisfy a height variety request.

Keep the central ultrawide console legible between or in front of equipment zones. Final rack count, heights, equipment ownership and exact models remain user decisions. Illustration studies should be labelled as model-informed concepts until these are confirmed.

## Incident and front/rear staging implications

- **PSU failure:** a redundant PSU warning can leave the system running. Use the user's rare whole-scene turn to reveal rear PSUs and cabling. Restore redundancy before clearing the warning; do not imply every PSU event immediately stops all workloads.
- **RAM pressure versus faulty memory:** full RAM is a capacity event, not proof of failed DIMMs. Begin with a monitoring/terminal diagnosis. For a physical upgrade, migrate/stop the relevant workload, shut down the affected machine, show slide-out/top access and DIMM installation, then boot and verify capacity. Do not animate live insertion of normal server DIMMs.
- **Disk capacity versus failed drive:** full storage can lead to a capacity expansion story; a failed drive leads to replacement and rebuild. Adding/replacing a disk does not instantly restore all capacity or complete a rebuild. Use clearly accelerated storytelling and a verification stage.
- **Application crash:** software-only failure can leave all server hardware indicators healthy. Show the affected service tile, a PuTTY/SSH/console session, diagnosis, restart/configuration change and a successful service check. A hardware repair is not required for every application fault.
- **Water spill:** direct it at a specific exposed device/bench component and let the shutdown/inspection/replacement story follow. Avoid the visual implication that wiping a powered wet chassis immediately fixes it.
- **UPS/mains incident:** room lights may go out while UPS-backed equipment remains alive. UPS battery/load indication, network continuity and controlled shutdown should be coherent with the chosen topology.
- **Networking:** front switch links are visible; most Dell/HPE NIC and management connections are rear. Use mapped cable endpoints and the rare rear view rather than drawing fictional RJ45 rows on server fronts.
- **Traffic dots:** an explanatory visual layer, not literal physical light inside copper. Their direction and rate should derive from the connection graph and current workload/incident, with disabled paths stopping and failover paths becoming active.

## Primary sources

### Dell

- [R640 front panel service reference](https://www.dell.com/support/manuals/en-us/poweredge-r640/per640_ism_pub/front-view-of-the-system?guid=guid-9b7dfce0-b970-4b3d-bfa7-15679a348dad)
- [R640 technical guide: chassis and internal views](https://i.dell.com/sites/csdocuments/shared-content_data-sheets_documents/en/us/poweredge-r640-technical-guide.pdf)
- [R740/R740xd technical guide: front configurations](https://i.dell.com/sites/csdocuments/shared-content_data-sheets_documents/en/aa/poweredge_r740_r740xd_technical_guide.pdf)
- [R740 front view and service-manual navigation](https://www.dell.com/support/manuals/en-au/oth-r740/per740_ism_pub/front-view-of-the-system?guid=guid-2fd8a622-b869-43f2-97d5-9d1d3a6f4d31)

### HPE

- [DL380 Gen10 QuickSpecs, with front configurations](https://www.hpe.com/int/en/collaterals/collateral.a00008180enw.html)
- [DL380 Gen10 service guide front panel components](https://support.hpe.com/hpesc/public/docDisplay?docId=a00018787en_us&page=GUID-2CB53008-2F39-4036-997A-E2D85A8953F0.html)

### Supermicro

- [SYS-420GP-TNR official 4U datasheet](https://www.supermicro.com/en/products/system/datasheet/sys-420gp-tnr)
- [SYS-821GE-TNHR official 8U product reference](https://www.supermicro.com/en/products/system/gpu/8u/sys-821ge-tnhr)

### Cisco

- [Catalyst 9300 hardware installation guide: models, front/rear panels and LEDs](https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9300/hardware/install/b_c9300_hig/Product-overview.html)
- [ASA 5508-X/5516-X hardware installation guide, front/rear diagrams](https://www.cisco.com/c/en/us/td/docs/security/asa/hw/maintenance/5508xguide/b_install_guide_5508.pdf)

### Small compute, UPS and ASIC

- [Intel NUC11TN technical product specification](https://www.intel.com/content/dam/support/us/en/documents/intel-nuc/NUC11TN_TechProdSpec.pdf)
- [APC/Schneider SMT1500RM2U product reference](https://www.se.com/us/en/product/SMT1500RM2U/apc-smartups-line-interactive-1500va-rackmount-2u-120v-6x-nema-515r-outlets-smartslot-avr-lcd/)
- [BITMAIN S19/S19 Pro setup reference and controller front-panel diagram](https://support.bitmain.com/hc/en-us/articles/4403022268697-How-to-set-up-a-new-S19-S19-Pro)

## Only unresolved hardware questions needed now

1. Which exact models/rack heights are actually owned? A rough list or equipment photos can be translated into the rack plan; do not require the user to write a full inventory spreadsheet.
2. Does “ASICs” mean mining appliances, network/AI accelerators, or both?
3. Is the tertiary connection AT&T cellular/hotspot only, or should an actual satellite link exist as a fourth path? User's latest wording names a hotspot as the example, so current plan should label it cellular.
